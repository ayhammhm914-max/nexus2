import { prisma } from "../../config/database";
import { env } from "../../config/env";

const getOrCreateCart = async (userId: string) => {
  const existing = await prisma.cart.findUnique({
    where: { userId }
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: { userId }
  });
};

export const cartService = {
  async get(userId: string) {
    const cart = await getOrCreateCart(userId);
    return prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                platform: true,
                category: true
              }
            }
          }
        }
      }
    });
  },

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await getOrCreateCart(userId);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    if (!product.unlimitedStock && product.stock < quantity) {
      throw new Error("Insufficient stock for this product.");
    }

    const currentItems = await prisma.cartItem.count({
      where: { cartId: cart.id }
    });

    if (currentItems >= env.MAX_CART_ITEMS) {
      throw new Error("Cart item limit reached.");
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      update: {
        quantity: {
          increment: quantity
        }
      },
      create: {
        cartId: cart.id,
        productId,
        quantity
      }
    });

    return this.get(userId);
  },

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await getOrCreateCart(userId);
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

    if (!product.unlimitedStock && product.stock < quantity) {
      throw new Error("Insufficient stock for this product.");
    }

    await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      data: {
        quantity
      }
    });

    return this.get(userId);
  },

  async removeItem(userId: string, productId: string) {
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId
      }
    });

    return this.get(userId);
  },

  async clear(userId: string) {
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return this.get(userId);
  },

  async validate(userId: string) {
    const cart = await this.get(userId);
    const issues = (cart?.items ?? [])
      .map((item) => {
        if (!item.product.isActive) {
          return {
            productId: item.productId,
            issue: "Product is no longer active."
          };
        }

        if (!item.product.unlimitedStock && item.product.stock < item.quantity) {
          return {
            productId: item.productId,
            issue: "Requested quantity exceeds stock."
          };
        }

        return null;
      })
      .filter(Boolean);

    return {
      valid: issues.length === 0,
      issues
    };
  }
};

