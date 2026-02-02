import { Suspense } from "react";
import { SearchPageClient } from "./search-page-client";
import { SearchPageSkeleton } from "./search-page-skeleton";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageClient />
    </Suspense>
  );
}
