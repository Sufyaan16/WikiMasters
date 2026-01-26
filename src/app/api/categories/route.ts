import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all categories
export async function GET() {
  try {
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

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newCategory = await db
      .insert(categories)
      .values({
        slug: body.slug,
        name: body.name,
        description: body.description,
        longDescription: body.longDescription,
        image: body.image,
        imageHover: body.imageHover || null,
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
