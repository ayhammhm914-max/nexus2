import { PaymentStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { emailTransport } from "../../config/email";
import { env } from "../../config/env";
import { stripe } from "../../config/stripe";
import { decryptKey } from "../../utils/crypto.utils";
import { orderConfirmationEmail } from "../../utils/email.templates";
import { generateOrderNumber } from "../../utils/orderNumber.utils";

const orderInclude = {
  items: {
    include: {
      deliveredKeys: true
    }
  }
} satisfies Prisma.OrderInclude;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export const ordersService = {
  async checkout(input: {
    userId?: string;
    guestEmail?: string;
    paymentMethod: "STRIPE" | "PAYPAL" | "WALLET";
    couponCode?: string;
    items: Array<{ productId: string; quantity: number }>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      throw new Error("Site settings are not configured.");
    }

    if (!input.userId && !settings.allowGuestCheckout) {
      throw new Error("Guest checkout is disabled.");
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: input.items.map((item) => item.productId)
        },
        isActive: true
      },
      include: {
        platform: true
      }
    });

    if (products.length !== input.items.length) {
      throw new Error("Some products are no longer available.");
    }

    let subtotal = 0;
    const orderItems = input.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        throw new Error("A selected product is unavailable.");
      }

      if (item.quantity < product.minQuantity || item.quantity > product.maxQuantity) {
        throw new Error(`Invalid quantity selected for ${product.name}.`);
      }

      if (!product.unlimitedStock && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      const unitPrice = Number(product.salePrice ?? product.basePrice);
      const totalPrice = roundMoney(unitPrice * item.quantity);
      subtotal += totalPrice;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        platformName: product.platform.name,
        region: product.region,
        coverImageUrl: product.coverImageUrl,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      };
    });

    let couponId: string | undefined;
    let discount = 0;

    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode.toUpperCase() }
      });

      if (!coupon || !coupon.isActive) {
        throw new Error("Coupon is invalid.");
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new Error("Coupon has expired.");
      }

      if (coupon.minOrderAmount && Number(coupon.minOrderAmount) > subtotal) {
        throw new Error("Order does not meet the coupon minimum.");
      }

      couponId = coupon.id;
      discount =
        coupon.type === "PERCENTAGE"
          ? roundMoney((subtotal * Number(coupon.value)) / 100)
          : Math.min(subtotal, Number(coupon.value));
    }

    const tax = roundMoney(((subtotal - discount) * Number(settings.taxRate)) / 100);
    const total = roundMoney(subtotal - discount + tax);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId,
        guestEmail: input.guestEmail,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: input.paymentMethod,
        subtotal,
        discount,
        tax,
        total,
        couponId,
        couponDiscount: discount,
        walletAmountUsed: 0,
        loyaltyPointsUsed: 0,
        currency: settings.defaultCurrency,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        items: {
          create: orderItems
        }
      },
      include: orderInclude
    });

    let clientSecret = "demo_client_secret";

    if (input.paymentMethod === "STRIPE" && env.STRIPE_SECRET_KEY) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: settings.defaultCurrency.toLowerCase(),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber
        }
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentIntentId: paymentIntent.id
        }
      });

      clientSecret = paymentIntent.client_secret ?? clientSecret;
    }

    return {
      order,
      clientSecret
    };
  },

  async listUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" }
    });
  },

  async getOrderDetail(userId: string, orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: orderInclude
    });

    if (!order || order.userId !== userId) {
      throw new Error("Order not found.");
    }

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        revealedKeys: item.deliveredKeys.map((key) => decryptKey(key.ciphertext, key.iv, key.authTag))
      }))
    };
  },

  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (order.userId !== userId) {
      throw new Error("Order not found.");
    }

    if (order.status !== "PENDING") {
      throw new Error("Only pending orders can be cancelled.");
    }

    if (Date.now() - order.createdAt.getTime() > 30 * 60 * 1000) {
      throw new Error("This order can no longer be cancelled.");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED"
      }
    });
  },

  async requestRefund(userId: string, orderId: string, reason: string) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (order.userId !== userId) {
      throw new Error("Order not found.");
    }

    return prisma.refund.create({
      data: {
        orderId,
        amount: order.total,
        reason
      }
    });
  },

  async createDispute(userId: string, orderId: string, reason: string) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (order.userId !== userId) {
      throw new Error("Order not found.");
    }

    return prisma.dispute.upsert({
      where: { orderId },
      update: {
        reason,
        status: "OPEN"
      },
      create: {
        orderId,
        reason
      }
    });
  },

  async completeOrderFromPaymentIntent(paymentIntentId: string) {
    const order = await prisma.order.findFirst({
      where: { paymentIntentId },
      include: {
        items: true,
        user: true
      }
    });

    if (!order || order.status === "COMPLETED") {
      return order;
    }

    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

    const completed = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: PaymentStatus.PAID
        }
      });

      for (const item of order.items) {
        if (!item.productId) {
          continue;
        }

        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId }
        });

        const keys = await tx.productKey.findMany({
          where: {
            productId: item.productId,
            isUsed: false
          },
          take: item.quantity,
          orderBy: { createdAt: "asc" }
        });

        if (!product.unlimitedStock && keys.length < item.quantity) {
          throw new Error(`Not enough keys available for ${item.productName}.`);
        }

        if (keys.length > 0) {
          await tx.deliveredKey.createMany({
            data: keys.map((key) => ({
              orderItemId: item.id,
              ciphertext: key.ciphertext,
              iv: key.iv,
              authTag: key.authTag
            }))
          });

          await tx.productKey.updateMany({
            where: {
              id: {
                in: keys.map((key) => key.id)
              }
            },
            data: {
              isUsed: true,
              usedAt: new Date(),
              usedByOrderItemId: item.id
            }
          });
        }

        await tx.orderItem.update({
          where: { id: item.id },
          data: { deliveredAt: new Date() }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: product.unlimitedStock ? product.stock : { decrement: item.quantity },
            soldCount: { increment: item.quantity }
          }
        });
      }

      if (order.userId && settings) {
        await tx.user.update({
          where: { id: order.userId },
          data: {
            loyaltyPoints: {
              increment: Math.floor(Number(order.total) * settings.loyaltyPointsRate)
            }
          }
        });

        await tx.notification.create({
          data: {
            userId: order.userId,
            type: "ORDER_UPDATE",
            title: "Order completed",
            message: `Your order ${order.orderNumber} is ready.`,
            link: `/orders/${order.orderNumber}`
          }
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID",
          completedAt: new Date()
        },
        include: orderInclude
      });
    });

    const recipientEmail = order.user?.email ?? order.guestEmail;
    if (recipientEmail) {
      await emailTransport.sendMail({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: `Order ${order.orderNumber} confirmed`,
        html: orderConfirmationEmail(order.orderNumber)
      });
    }

    return completed;
  },

  async failOrderFromPaymentIntent(paymentIntentId: string) {
    return prisma.order.updateMany({
      where: {
        paymentIntentId
      },
      data: {
        status: "FAILED",
        paymentStatus: "UNPAID"
      }
    });
  }
};

