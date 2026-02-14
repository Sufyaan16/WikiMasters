"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Upload, ImagePlus, X, Loader2 } from "lucide-react";

interface Textarea extends HTMLTextAreaElement {}

export function NewProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(Array(6).fill(""));
  const [galleryUploading, setGalleryUploading] = useState<Record<number, boolean>>({});

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { uploading: imageUploading, uploadFile } = useCloudinaryUpload();

  const removeGalleryUrl = (index: number) => {
    const updated = [...galleryUrls];
    updated[index] = "";
    setGalleryUrls(updated);
  };

  const updateGalleryUrl = (index: number, value: string) => {
    const updated = [...galleryUrls];
    updated[index] = value;
    setGalleryUrls(updated);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) setImagePreview(url);
    }
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setGalleryUploading((prev) => ({ ...prev, [index]: true }));
      const url = await uploadFile(file);
      if (url) updateGalleryUrl(index, url);
      setGalleryUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Create product data object
      const productData = {
        name: formData.get("name") as string,
        company: formData.get("company") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        priceRegular: parseFloat(formData.get("price") as string),
        priceSale: formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : null,
        priceCurrency: "USD",
        imageSrc: imagePreview, // Cloudinary URL
        imageAlt: formData.get("name") as string,
        badgeText: formData.get("badgeText") as string || null,
        badgeBackgroundColor: formData.get("badgeColor") as string || null,
        // Inventory Management
        sku: formData.get("sku") as string || null,
        stockQuantity: formData.get("stockQuantity") ? parseInt(formData.get("stockQuantity") as string) : 0,
        lowStockThreshold: formData.get("lowStockThreshold") ? parseInt(formData.get("lowStockThreshold") as string) : 10,
        trackInventory: formData.get("trackInventory") === "on",
        galleryImages: galleryUrls.filter((url) => url.trim() !== ""),
      };

      // Send to API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const newProduct = await response.json();
      setLoading(false);

      // Show success message
      const { default: Swal } = await import("sweetalert2");
      const result = await Swal.fire({
        title: "Success!",
        text: `${productData.name} has been added successfully.`,
        icon: "success",
        confirmButtonText: "View Products",
        showCancelButton: true,
        cancelButtonText: "Add Another",
      });

      if (result.isConfirmed) {
        router.push("/admin/products");
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset();
        setImagePreview("");
        setGalleryUrls(Array(6).fill(""));
      }
    } catch (error) {
      setLoading(false);
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Error!",
        text: "Failed to create product. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        {/* <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the details below to add a new product
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Legend Pro Elite"
              required
            />
          </div>

          {/* Company/Brand */}
          <div className="space-y-2">
            <Label htmlFor="company">
              Company/Brand <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="e.g., Ihsan"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cricketbats">Cricket Bats</SelectItem>
                <SelectItem value="cricketgear">Sports Apparel</SelectItem>
                <SelectItem value="cricketaccessories">Cricket Accessories</SelectItem>
                <SelectItem value="cricketgloves">Protection Gears</SelectItem>
                <SelectItem value="tapballbats">Tape Ball Bats</SelectItem>
                <SelectItem value="cricketbags">Cricket Bags</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the product features and benefits..."
              rows={4}
              required
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Regular Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="299.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price ($)</Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                step="0.01"
                placeholder="249.00 - Must be Less than Regular Price"
              />
            </div>
          </div>

          {/* Image Upload - Dotted Square */}
          <div className="space-y-2">
            <Label>
              Product Image (Primary) <span className="text-red-500">*</span>
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
              JPG, PNG, or WebP — click the square to upload
            </p>
          </div>

          {/* Gallery Images - 3×2 Grid of Dotted Squares */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <h3 className="text-lg font-semibold">Gallery Images</h3>
              <p className="text-sm text-muted-foreground">
                Upload up to 6 gallery images for the product card hover effect
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {galleryUrls.map((url, index) => (
                <div
                  key={index}
                  className=" h-60 w-90 aspect-square border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors overflow-hidden group"
                  onClick={() => !galleryUploading[index] && galleryInputRefs.current[index]?.click()}
                >
                  {url ? (
                    <>
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); removeGalleryUrl(index); }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : galleryUploading[index] ? (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-[10px]">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[10px]">Gallery {index + 1}</span>
                    </div>
                  )}
                  <input
                    ref={(el) => { galleryInputRefs.current[index] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGalleryFileChange(e, index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Management Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Inventory Management</h3>
            
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="e.g., BAT-ENG-001"
              />
              <p className="text-sm text-muted-foreground">
                Unique identifier for inventory tracking
              </p>
            </div>

            {/* Stock Quantity and Low Stock Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">
                  Stock Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Current available stock
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  defaultValue="10"
                />
                <p className="text-sm text-muted-foreground">
                  Alert when stock falls below this
                </p>
              </div>
            </div>

            {/* Track Inventory Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trackInventory"
                name="trackInventory"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="trackInventory" className="font-normal">
                Track inventory for this product
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1">
              {loading ? "Adding Product..." : imageUploading ? "Uploading Image..." : "Add Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
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
