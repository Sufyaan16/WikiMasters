'use client'

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BANNER_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920&q=80",
    alt: "Cricket Equipment Banner 1",
  },
  {
    src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&q=80",
    alt: "Cricket Equipment Banner 2",
  },
  {
    src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=1920&q=80",
    alt: "Cricket Equipment Banner 3",
  },
  {
    src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80",
    alt: "Cricket Equipment Banner 4",
  },
];

export function CategoryBanner() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <section className="relative w-full h-screen">
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-screen">
          {BANNER_IMAGES.map((image, index) => (
            <CarouselItem key={index} className="h-screen">
              <div className="relative w-full h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                      Shop by Category
                    </h1>
                    <p className="text-xl md:text-2xl">
                      Find the perfect cricket equipment for your game
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 md:left-8 w-12 h-12 md:w-14 md:h-14" />
        <CarouselNext className="right-4 md:right-8 w-12 h-12 md:w-14 md:h-14" />
      </Carousel>
    </section>
  );
}
