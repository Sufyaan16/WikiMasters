import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CRICKET_BATS } from "@/lib/data/products";

export default async function AdminProductsPage() {
  const user = await stackServerApp.getUser();

  if (!user || (user.clientMetadata !== "admin" && user.clientMetadata?.role !== "admin")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">
              Manage all your products here
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button size="lg">Add New Product</Button>
          </Link>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({CRICKET_BATS.length})</CardTitle>
            <CardDescription>
              Currently showing static data. Database integration coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CRICKET_BATS.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image.src}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.company} • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        ${product.price.sale || product.price.regular}
                      </p>
                      {product.price.sale && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${product.price.regular}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
