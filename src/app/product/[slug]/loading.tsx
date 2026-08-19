export default function ProductLoading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="h-4 w-32 animate-pulse rounded bg-brand-sky-light" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-brand-sky-light" />
        <div>
          <div className="h-8 w-2/3 animate-pulse rounded bg-brand-sky-light" />
          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-brand-sky-light/70" />
          <div className="mt-6 h-24 w-full animate-pulse rounded bg-brand-sky-light/50" />
          <div className="mt-6 h-12 w-40 animate-pulse rounded-full bg-brand-sky-light" />
        </div>
      </div>
    </div>
  );
}
