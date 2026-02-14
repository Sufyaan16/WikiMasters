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
import Link from "next/link";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Upload, X, Loader2 } from "lucide-react";

export function NewCategoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
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

    try {
      const formData = new FormData(e.currentTarget);
      
      // Create category data object
      const categoryData = {
        slug: formData.get("slug") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        longDescription: formData.get("longDescription") as string,
        image: imagePreview, // For now using the preview
      };

      // Send to API
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();
      setLoading(false);

      // Show success message
      const { default: Swal } = await import("sweetalert2");
      const result = await Swal.fire({
        title: "Success!",
        text: `${categoryData.name} category has been added successfully.`,
        icon: "success",
        confirmButtonText: "View Categories",
        showCancelButton: true,
        cancelButtonText: "Add Another",
      });

      if (result.isConfirmed) {
        router.push("/admin/categories");
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset();
        setImagePreview("");
      }
    } catch (error) {
      setLoading(false);
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Error!",
        text: "Failed to create category. Please try again.",
        icon: "error",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .replace(/-+/g, "");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader> */}
          {/* <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Fill in the details below to add a new category
          </CardDescription> */}
        {/* </CardHeader> */}
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
              required
              onChange={(e) => {
                const slugInput = document.getElementById("slug") as HTMLInputElement;
                if (slugInput) {
                  slugInput.value = generateSlug(e.target.value);
                }
              }}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              placeholder="cricketbats"
              required
              pattern="[a-z0-9]+"
              title="Only lowercase letters and numbers, no spaces or special characters"
            />
            <p className="text-sm text-muted-foreground">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select name="type" required>
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
              required
            />
          </div>

          {/* Image Upload - Dotted Square */}
          <div className="space-y-2">
            <Label>
              Category Image (Primary) <span className="text-red-500">*</span>
            </Label>
            <div
              className="relative w-40 h-40 border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden group"
              onClick={() => !imageUploading && primaryInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImagePreview(""); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : imageUploading ? (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-xs">Upload Image</span>
                </div>
              )}
              <input
                ref={primaryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: 1920x1080px — click the square to upload
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1">
              {loading ? "Adding Category..." : imageUploading ? "Uploading Image..." : "Add Category"}
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
