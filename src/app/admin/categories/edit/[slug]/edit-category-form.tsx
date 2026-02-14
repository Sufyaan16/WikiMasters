"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CategoryInfo } from "@/lib/data/categories";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Upload, X, Loader2 } from "lucide-react";

interface EditCategoryFormProps {
  category: CategoryInfo;
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(category.image);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const { uploading: imageUploading, uploadFile } = useCloudinaryUpload();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const categoryData = {
      name: formData.get("name"),
      slug: category.slug, // Slug shouldn't change on edit
      type: formData.get("type"),
      description: formData.get("description"),
      longDescription: formData.get("longDescription"),
      image: imagePreview || category.image,
    };

    try {
      const response = await fetch(`/api/categories/${category.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      setLoading(false);

      // Show success message
      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        title: "Updated!",
        text: `${categoryData.name} has been updated successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      setLoading(false);
      const { default: Swal } = await import("sweetalert2");
      await Swal.fire({
        title: "Error!",
        text: "Failed to update category. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader>
          <CardTitle>Edit Category</CardTitle>
          <CardDescription>
            Update the category details below
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-6">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Cricket Bats"
              defaultValue={category.name}
              required
            />
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={category.slug}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Slug cannot be changed after creation
            </p>
          </div>

          {/* Type - We'll infer from category data or use a default */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" defaultValue="bat" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bat">Bat</SelectItem>
                <SelectItem value="bag">Bag</SelectItem>
                <SelectItem value="gear">Gear</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="protection">Protection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Short Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description for category cards..."
              rows={2}
              defaultValue={category.description}
              required
            />
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <Label htmlFor="longDescription">
              Long Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="longDescription"
              name="longDescription"
              placeholder="Detailed description for category page banner..."
              rows={4}
              defaultValue={category.longDescription}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Category Image (Primary)</Label>
            <p className="text-sm text-muted-foreground">
              Click the square to upload or replace the banner image (recommended: 1920×1080px)
            </p>
            <div
              className="group relative w-40 h-40 border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden"
              onClick={() => primaryInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') primaryInputRef.current?.click(); }}
              role="button"
              tabIndex={0}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(""); }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : imageUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <input
                ref={primaryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={imageUploading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1">
              {loading ? "Updating Category..." : imageUploading ? "Uploading Image..." : "Update Category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/categories")}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
