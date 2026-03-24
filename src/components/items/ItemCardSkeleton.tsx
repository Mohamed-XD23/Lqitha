export default function ItemCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-void border border-gold/18 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video w-full rounded-t-xl bg-obsidian flex items-center justify-center">
        <svg
          viewBox="0 0 16 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-10 h-10 text-gold/10"
        >
          <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
          <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        {/* Badge row: type pill + category label */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-14 rounded-full bg-gold/10" />
          <div className="h-3 w-16 rounded-full bg-gold/10" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-3/4 rounded-full bg-gold/10" />
          <div className="h-4 w-1/2 rounded-full bg-gold/10" />
        </div>

        {/* Footer: location + date */}
        <div className="flex items-center justify-between border-t border-gold/10 pt-3 mt-1">
          <div className="h-3 w-24 rounded-full bg-gold/10" />
          <div className="h-3 w-16 rounded-full bg-gold/10" />
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
