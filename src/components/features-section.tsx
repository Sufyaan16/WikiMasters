import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import Image, { StaticImageData } from "next/image";
import COD from "../../public/cod.png";
import customer from "../../public/customer.png";
import outlet from "../../public/outlet.jpg";

interface Feature {
  title: string;
  image: StaticImageData;
  description: string;
}

const FEATURES: Feature[] = [
  {
    title: "COD SHIPPING",
    image: COD,
    description: "COD Shipping All Over Pakistan",
  },
  {
    title: "CUSTOMER SUPPORT",
    image: customer,
    description: "Online Customer Support",
  },
  {
    title: "DIRECT FACTORY OUTLET",
    image: outlet,
    description: "Quality Guarantee",
  },
];

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section className={cn("border-y border-border bg-background", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 justify-center md:justify-start"
            >
              <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={100}
                  height={100}
                  className="object-cover w-full h-[95px]"
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-bold text-md md:text-2xl  text-neutral-600">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-lg text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              {index < FEATURES.length - 1 && (
                <Separator orientation="vertical" className="h-24" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
