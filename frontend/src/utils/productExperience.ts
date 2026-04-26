import type { Language } from "../i18n/translations";
import type { Product } from "../types/product.types";
import { getPlatformRedeemLabel, getProductOfferLabel } from "./storefront";

const regionLabels: Record<Language, Record<string, string>> = {
  en: {
    GLOBAL: "Global",
    US: "United States",
    EU: "Europe",
    UK: "United Kingdom",
    TR: "Turkey",
    AR: "Argentina",
    BR: "Brazil",
    MENA: "Middle East",
    APAC: "Asia Pacific"
  },
  ar: {
    GLOBAL: "عالمي",
    US: "الولايات المتحدة",
    EU: "أوروبا",
    UK: "المملكة المتحدة",
    TR: "تركيا",
    AR: "الأرجنتين",
    BR: "البرازيل",
    MENA: "الشرق الأوسط",
    APAC: "آسيا والمحيط الهادئ"
  }
};

const specialBlurbs: Record<string, string> = {
  "cyberpunk-2077":
    "Step into Night City for a story-heavy open-world RPG packed with build variety, cinematic quests, and a huge futuristic sandbox.",
  "elden-ring":
    "Explore a massive dark-fantasy world built around tough combat, discovery, memorable bosses, and the freedom to shape your own path.",
  "red-dead-redemption-2":
    "Ride through a richly detailed frontier with a cinematic outlaw story, deep exploration, and one of the most immersive open worlds in gaming.",
  "gta-v":
    "Jump into Los Santos for chaotic missions, open-world freedom, and Grand Theft Auto Online from one of the most popular action games ever made.",
  "hogwarts-legacy":
    "Live out the Hogwarts fantasy with spell combat, magical exploration, and a full single-player adventure set in the wizarding world.",
  "forza-horizon-5":
    "Race across Mexico in an open-world driving festival with hundreds of cars, evolving seasons, and instant pick-up-and-play fun.",
  "the-witcher-3":
    "Follow Geralt through a massive fantasy world filled with deep quests, meaningful choices, and one of the strongest RPG stories on PC."
};

export const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];

export const getProductRegionLabel = (region: string, language: Language = "en") =>
  regionLabels[language][region] ?? region;

export const getYoutubeSearchUrl = (product: Product) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${product.name} official trailer`)}`;

export const getProductGallery = (product: Product) => {
  const gallery = [
    product.coverImageUrl,
    product.thumbnailUrl,
    ...toStringArray(product.images)
  ].filter(Boolean) as string[];

  return [...new Set(gallery)];
};

export const getProductNarrative = (product: Product, language: Language = "en") => {
  const offerLabel = getProductOfferLabel(product, language);
  const platformRedeem = getPlatformRedeemLabel(product.platform.name, language);
  const regionLabel = getProductRegionLabel(product.region, language);
  const tags = toStringArray(product.tags);

  if (language === "ar") {
    if (product.category.slug === "gift-cards") {
      return {
        eyebrow: "رصيد متجر",
        lead: `اشحن الرصيد فورًا مع ${offerLabel} لمنصة ${product.platform.name}. المنتج مخصص لمنطقة ${regionLabel} ويتم تسليمه من NEXUS خلال ثوان.`,
        overview:
          "هذا المنتج يمنحك رصيد محفظة رقميًا واضحًا. مناسب لشراء الألعاب، الإضافات، الاشتراكات، ومشتريات المتجر بدون انتظار أو بائعين عشوائيين.",
        bullets: [
          "تسليم رقمي فوري بعد الدفع",
          `مخصص للتفعيل في منطقة ${regionLabel}`,
          "مناسب للإهداء أو شحن محفظتك",
          "مخزون موثق من بائع واحد في NEXUS"
        ],
        includes: [
          "كود محفظة رقمي واحد",
          `التفعيل على ${product.platform.name}`,
          "تسليم سريع داخل صفحة طلبك",
          "دعم بسيط إذا احتجت مساعدة في التفعيل"
        ],
        faqs: [
          {
            question: "ماذا أشتري بالضبط؟",
            answer: `أنت تشتري رصيد متجر حقيقي لمنصة ${product.platform.name} ويتم تسليمه ككود رقمي.`
          },
          {
            question: "كيف يتم التسليم؟",
            answer: "يظهر الكود في صفحة طلبك مباشرة بعد نجاح الدفع."
          },
          {
            question: "هل يمكنني استخدامه في أي مكان؟",
            answer: `استخدمه في المنطقة المذكورة لهذا المنتج: ${regionLabel}.`
          }
        ],
        platformRedeem
      };
    }

    if (product.category.slug === "subscriptions") {
      return {
        eyebrow: "وصول اشتراك",
        lead: `فعّل ${product.name} بسرعة عبر كود رقمي آمن من NEXUS وابدأ استخدام الاشتراك بدون انتظار معالجة يدوية.`,
        overview:
          "هذا المنتج مخصص للاعبين الذين يريدون وصولًا سريعًا للعضويات أو مكتبات الألعاب أو مزايا الحساب. التجربة بسيطة: اشتر، استلم الكود، فعّله على المنصة الصحيحة، وابدأ الاستخدام.",
        bullets: [
          "تسليم سريع بعد تأكيد الدفع",
          `تفعيل واضح على ${product.platform.name}`,
          "مناسب للاستخدام الشخصي أو الإهداء",
          "مخزون موثق من بائع واحد"
        ],
        includes: [
          "كود تفعيل واحد",
          "تسليم رقمي داخل صفحة طلبك",
          "تسمية واضحة حسب المنطقة",
          "دعم إذا ظهرت أسئلة أثناء التفعيل"
        ],
        faqs: [
          {
            question: "هل هذه بطاقة فعلية؟",
            answer: "لا. هذا كود اشتراك رقمي يظهر لك بعد الدفع."
          },
          {
            question: "هل أحتاج حسابًا أولًا؟",
            answer: `نعم. تقوم بتفعيله على حسابك الحالي في ${product.platform.name}.`
          },
          {
            question: "هل يضاف إلى اشتراكي الحالي؟",
            answer: "يعتمد ذلك على قوانين المنصة، لكن في كثير من الحالات يمكن تمديد مدة الاشتراك."
          }
        ],
        platformRedeem
      };
    }

    if (product.category.slug === "in-game-currency") {
      return {
        eyebrow: "عملة داخل اللعبة",
        lead: `احصل على ${product.name} فورًا واشحن رصيد لعبتك بكود رقمي آمن مع توضيح المنصة والمنطقة.`,
        overview:
          "هذا المنتج مخصص للشحن السريع داخل الألعاب. سواء كنت تشتري رصيدًا لموسم لعب، عناصر تجميلية، أو نقاطًا تنافسية، يقوم NEXUS بتسليم الكود رقميًا حتى تعود للعبة بسرعة.",
        bullets: [
          "تسليم سريع للشحن",
          "توضيح واضح للمنصة والمنطقة",
          "دفع آمن ومخزون موثق",
          "مناسب للإهداء للأصدقاء والفريق"
        ],
        includes: [
          "كود عملة رقمي واحد",
          "عرض فوري داخل صفحة طلبك",
          "إرشادات تفعيل بسيطة",
          "دعم إذا احتجت مساعدة في التفعيل"
        ],
        faqs: [
          {
            question: "هل أشتري اللعبة نفسها؟",
            answer: "لا. هذا المنتج عملة داخل اللعبة أو رصيد حساب للعبة تلعبها بالفعل."
          },
          {
            question: "كيف أستلمه؟",
            answer: "تستلم كودًا رقميًا مباشرة بعد الدفع داخل تفاصيل الطلب."
          },
          {
            question: "هل يمكن تفعيله في أي منطقة؟",
            answer: `استخدم المنطقة الظاهرة في صفحة المنتج. هذا المنتج محدد لمنطقة ${regionLabel}.`
          }
        ],
        platformRedeem
      };
    }

    return {
      eyebrow: "وصول للعبة كاملة",
      lead: `أنت تشتري ${product.name} كلعبة كاملة يتم تسليمها ككود رقمي. اشتر من NEXUS، استلم الكود فورًا، فعّله على ${product.platform.name}، وابدأ اللعب.`,
      overview:
        `${product.name} متوفرة هنا كمنتج لعبة رقمية كاملة من بائع واحد موثق. الصفحة مصممة لإزالة الالتباس: هذا ليس فتحًا مؤقتًا أو بيانات عشوائية، بل كود لعبة رقمي حقيقي للتفعيل على المنصة الصحيحة.`,
      bullets: [
        "وصول للعبة كاملة بتسليم رقمي",
        `التفعيل مباشرة على ${product.platform.name}`,
        `المنطقة موضحة: ${regionLabel}`,
        "مخزون موثق من بائع واحد"
      ],
      includes: [
        "كود رقمي للعبة كاملة",
        "تسليم سريع إلى صفحة طلبك",
        "إرشادات تفعيل واضحة للمنصة",
        "دعم إذا احتجت مساعدة في التفعيل"
      ],
      faqs: [
        {
          question: "هل أشتري اللعبة الحقيقية؟",
          answer: "نعم. أنت تشتري اللعبة الكاملة ويتم تسليمها ككود رقمي."
        },
        {
          question: "كيف يعمل التسليم؟",
          answer: "بعد الدفع، يظهر الكود في صفحة طلبك الآمنة حتى تفعّله مباشرة."
        },
        {
          question: "أين أقوم بالتفعيل؟",
          answer: platformRedeem
        }
      ],
      platformRedeem
    };
  }

  if (product.category.slug === "gift-cards") {
    return {
      eyebrow: "Store Credit",
      lead: `Add balance instantly with a ${offerLabel.toLowerCase()} for ${product.platform.name}, prepared for the ${regionLabel} region and delivered from NEXUS in seconds.`,
      overview:
        `This product gives you direct wallet credit for ${product.platform.name}. It is ideal for buying games, DLC, subscriptions, and in-store purchases without waiting for manual delivery or risky third-party sellers.`,
      bullets: [
        "Instant digital delivery after checkout",
        `Made for ${regionLabel} redemption`,
        "Good for gifting or topping up your own wallet",
        "Verified single-seller stock from NEXUS"
      ],
      includes: [
        "One digital wallet code",
        `Redemption on ${product.platform.name}`,
        "Fast on-screen delivery in your order page",
        "Simple support if you need help redeeming"
      ],
      faqs: [
        {
          question: "What am I buying exactly?",
          answer: `You are buying real ${product.platform.name} store credit delivered as a digital code.`
        },
        {
          question: "How is it delivered?",
          answer: "Your code appears in your order page right after successful payment."
        },
        {
          question: "Can I use it anywhere?",
          answer: `Use it in the region listed for this product: ${regionLabel}.`
        }
      ],
      platformRedeem
    };
  }

  if (product.category.slug === "subscriptions") {
    return {
      eyebrow: "Membership Access",
      lead: `Activate ${product.name} quickly with a secure digital code from NEXUS and start using your membership without waiting for manual processing.`,
      overview:
        "This subscription product is designed for players who want fast access to memberships, libraries, or premium account benefits. NEXUS keeps the flow simple: buy, receive your code, redeem it on the correct platform, and start using the service.",
      bullets: [
        "Fast delivery after payment confirmation",
        `Clear redemption on ${product.platform.name}`,
        "Good for personal use or gifting",
        "Trusted single-seller stock"
      ],
      includes: [
        "One activation code",
        "Digital delivery in your order page",
        "Region-aware product labeling",
        "Premium support if activation questions come up"
      ],
      faqs: [
        {
          question: "Is this a physical card?",
          answer: "No. It is a digital subscription code shown online after checkout."
        },
        {
          question: "Do I need an account first?",
          answer: `Yes. You redeem this on your existing ${product.platform.name} account.`
        },
        {
          question: "Will it stack with my current membership?",
          answer: "That depends on the platform rules, but in many cases subscription time can be extended."
        }
      ],
      platformRedeem
    };
  }

  if (product.category.slug === "in-game-currency") {
    return {
      eyebrow: "Game Currency",
      lead: `Get ${product.name} instantly and top up your game balance with a secure digital code, clearly labeled for platform and region.`,
      overview:
        "This product is built for fast top-ups. Whether you are buying battle pass funds, cosmetic currency, or competitive points, NEXUS delivers the code digitally so you can redeem it quickly and jump back into the game.",
      bullets: [
        "Fast delivery for quick top-ups",
        "Clear platform and region labeling",
        "Secure checkout and verified stock",
        "Easy gifting for friends and teammates"
      ],
      includes: [
        "One digital currency code",
        "Instant display in your account order page",
        "Simple redemption guidance",
        "Support if you need activation help"
      ],
      faqs: [
        {
          question: "Am I buying the game itself?",
          answer: "No. This product is in-game currency or account credit for a game you already play."
        },
        {
          question: "How do I receive it?",
          answer: "You receive a digital code immediately after checkout inside your order details."
        },
        {
          question: "Can I redeem it on any region?",
          answer: `Use the region shown on the product page. This one is marked for ${regionLabel}.`
        }
      ],
      platformRedeem
    };
  }

  return {
    eyebrow: "Full Game Access",
    lead: `You are buying the full game, delivered as a digital code. Buy on NEXUS, receive the code instantly, redeem it on ${product.platform.name}, and start playing.`,
    overview:
      specialBlurbs[product.slug] ??
      `${product.name} is available here as a full digital game product from a single verified seller. The page is built to remove confusion: this is not a random password or a temporary unlock, it is a real digital game code for redemption on the correct platform.`,
    bullets: [
      "Full game access delivered digitally",
      `Redeem directly on ${product.platform.name}`,
      `Region clearly marked as ${regionLabel}`,
      `Popular tags: ${tags.slice(0, 3).join(", ") || "action, digital, instant"}`
    ],
    includes: [
      "Full game digital code",
      "Fast delivery to your order page",
      "Clear platform redemption instructions",
      "Support if you need help activating"
    ],
    faqs: [
      {
        question: "Am I buying the actual game?",
        answer: "Yes. You are buying the full game, delivered as a digital code."
      },
      {
        question: "How does delivery work?",
        answer: "After payment, your code appears in your secure order page so you can redeem it immediately."
      },
      {
        question: "Where do I redeem it?",
        answer: platformRedeem
      }
    ],
    platformRedeem
  };
};

export const getRedeemSteps = (product: Product, language: Language = "en") => {
  const platformRedeem = getPlatformRedeemLabel(product.platform.name, language);

  if (language === "ar") {
    return [
      {
        title: "اختر المنتج",
        description: `اختر ${product.name} وراجع تفاصيل المنصة والمنطقة قبل الدفع.`
      },
      {
        title: "ادفع بأمان",
        description: "أكمل الدفع مع تسليم رقمي فوري من NEXUS."
      },
      {
        title: "استلم الكود",
        description: "افتح صفحة طلبك لعرض كود المنتج أو معلومات الرصيد الرقمي."
      },
      {
        title: "فعّل واستخدم",
        description: `${platformRedeem} وابدأ استخدام المنتج فورًا.`
      }
    ];
  }

  return [
    {
      title: "Choose your product",
      description: `Pick ${product.name} and review the platform and region details before checkout.`
    },
    {
      title: "Checkout securely",
      description: "Complete payment with instant digital delivery from NEXUS."
    },
    {
      title: "Receive your code",
      description: "Open your order page to view the product code or digital credit information."
    },
    {
      title: "Redeem and play",
      description: `${platformRedeem} and start using the product right away.`
    }
  ];
};
