export default function ShopLoading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="h-8 w-40 animate-pulse rounded bg-brand-sky" />
      <div className="mt-6 h-10 w-full animate-pulse rounded-full bg-brand-sky/60" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square animate-pulse rounded-xl bg-brand-sky" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-brand-sky/70" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-brand-sky/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
