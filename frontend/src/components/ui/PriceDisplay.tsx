import { calculateDiscount, formatCurrency } from "../../utils/format";

export const PriceDisplay = ({
  basePrice,
  salePrice
}: {
  basePrice: number;
  salePrice?: number | null;
}) => {
  const discount = calculateDiscount(basePrice, salePrice);
  const activePrice = salePrice ?? basePrice;

  return (
    <div className="flex items-end gap-3">
      <div className="text-xl font-bold text-primary">{formatCurrency(activePrice)}</div>
      {salePrice ? (
        <>
          <div className="text-sm text-muted line-through">{formatCurrency(basePrice)}</div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-danger">
            -{discount}%
          </div>
        </>
      ) : null}
    </div>
  );
};

