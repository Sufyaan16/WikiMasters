import { CategoryBanner } from "@/components/category-banner";
import { CategoryCards } from "@/components/category-cards";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen">
      <CategoryBanner />
      <CategoryCards />
    </div>
  );
}
