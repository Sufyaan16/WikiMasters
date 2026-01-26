import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoriesList } from "./categories-list";
import { CategoriesBulkActions } from "./bulk-actions";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminCategoriesPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/handler/sign-in");
  }

  // Fetch categories from database
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt));

  // Transform database categories to match frontend format
  const transformedCategories = allCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    longDescription: category.longDescription,
    image: category.image,
    imageHover: category.imageHover || undefined,
  }));

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your categories here
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CategoriesBulkActions categories={transformedCategories} />
          <Link href="/admin/categories/new">
            <Button>Add New Category</Button>
          </Link>
        </div>
      </div>

      <CategoriesList categories={transformedCategories} />
    </div>
  );
}
