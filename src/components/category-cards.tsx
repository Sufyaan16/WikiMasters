import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import cricketBat from '../../public/cricket-bat.png'
import cricketGEAR from '../../public/gear.png'
import cricketACCESSORIES from '../../public/accessories.png'
import cricketTAPEBALL from '../../public/tapeball-bat.png'
import cricketAPPAREL from '../../public/apparel.png'
import cricketBAGS from '../../public/bags.png'

interface Category {
  name: string;
  slug: string;
  image: string;
//   description: string;
}

const CATEGORIES: Category[] = [
  {
    name: "CRICKET BATS",
    slug: "cricketbats",
    image: cricketBat.src,
  },
  {
    name: "SPORTS APPAREL",
    slug: "cricketgear",
    image: cricketAPPAREL.src,
  },
  {
    name: "CRICKET ACCESSORIES",
    slug: "cricketaccessories",
    image: cricketACCESSORIES.src,
  },
  {
    name: "PROTECTION GEARS",
    slug: "cricketgloves",
    image: cricketGEAR.src,
  },
  {
    name: "TAPE BALL BATS",
    slug: "tapballbats",
    image: cricketTAPEBALL.src,
  },
  {
    name: "Cricket Bags",
    slug: "cricketbags",
    image: cricketBAGS.src,

  }
];

interface CategoryCardsProps {
  className?: string;
}

export function CategoryCards({ className }: CategoryCardsProps) {
  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20 bg-background", className)}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Browse Our Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore our wide range of cricket equipment and accessories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products/categories/${category.slug}`}
              className="group"
            >
              <Card className="relative h-75 overflow-hidden border-2 transition-all duration-300 hover:border-outline hover:shadow-2xl">
                <div className="relative w-full h-full">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {category.name}
                    </h3>
                    {/* <p className="text-sm text-white/90 drop-shadow-md">
                      {category.description}
                    </p> */}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
