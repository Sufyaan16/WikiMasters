import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header Skeleton */}
        <div className="mb-6">
          {/* Search Bar Skeleton */}
          <div className="flex gap-2 mb-4">
            <Skeleton className="flex-1 h-12" />
            <Skeleton className="w-24 h-12" />
          </div>

          {/* Title and Controls Skeleton */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="hidden sm:block w-20 h-10" />
              <Skeleton className="w-[180px] h-10" />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar Skeleton */}
          <aside className="w-full lg:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                {/* Filter Title */}
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="w-24 h-9" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-9 h-9" />
                ))}
              </div>
              <Skeleton className="w-20 h-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
