export const formatCurrency = (amount: number, currency = "USD", locale = "en-US") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(amount);

export const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

export const calculateDiscount = (basePrice: number, salePrice?: number | null) => {
  if (!salePrice || salePrice >= basePrice) {
    return 0;
  }

  return Math.round(((basePrice - salePrice) / basePrice) * 100);
};

