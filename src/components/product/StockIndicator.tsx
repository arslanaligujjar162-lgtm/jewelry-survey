const LOW_STOCK_THRESHOLD = 5;

export function StockIndicator({ stock, className = "" }: { stock: number; className?: string }) {
  if (stock <= 0) {
    return <p className={`font-body text-xs font-medium text-brand-error ${className}`}>Out of stock</p>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <p className={`font-body text-xs font-medium text-brand-error ${className}`}>
        Only {stock} left in stock
      </p>
    );
  }
  return <p className={`font-body text-xs text-brand-success ${className}`}>In stock</p>;
}
