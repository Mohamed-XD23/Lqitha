export default function ItemDetailLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header / Breadcrumb skeleton */}
        <div className="mb-10 flex items-center gap-4 animate-pulse">
          <div className="h-6 w-16 rounded-full bg-primary/10" />
          <div className="h-4 w-20 rounded-full bg-primary/10" />
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Image Section skeleton */}
          <div className="animate-pulse">
            <div className="aspect-square overflow-hidden rounded-xl bg-card border-2 border-primary/18 shadow-2xl flex items-center justify-center">
              <svg
                viewBox="0 0 16 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-14 h-14 text-primary/10"
              >
                <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
                <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
              </svg>
            </div>
          </div>

          {/* Content Section skeleton */}
          <div className="flex flex-col gap-8 animate-pulse">
            {/* Title + description */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-3/4 rounded-full bg-primary/10" />
                <div className="h-8 w-1/2 rounded-full bg-primary/10" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-primary/10" />
                <div className="h-4 w-5/6 rounded-full bg-primary/10" />
                <div className="h-4 w-2/3 rounded-full bg-primary/10" />
              </div>
            </div>

            {/* Property Grid skeleton */}
            <div className="bg-card border border-primary/15 rounded-xl overflow-hidden shadow-xl">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-primary/10" />
                    <div className="h-3 w-16 rounded-full bg-primary/10" />
                  </div>
                  <div className="h-4 w-24 rounded-full bg-primary/10" />
                </div>
              ))}
            </div>

            {/* Publisher Profile skeleton */}
            <div className="flex items-center gap-4 bg-card border border-primary/15 rounded-xl px-6 py-5 shadow-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded-full bg-primary/10" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 rounded-full bg-primary/10" />
                  <div className="h-3 w-24 rounded-full bg-primary/10" />
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-primary/10" />
            </div>

            {/* Action Button skeleton */}
            <div className="mt-4">
              <div className="h-12 w-full rounded-full bg-primary/10" />
            </div>
          </div>
        </div>

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
