"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconBrandInstagram, IconHeart, IconMessageCircle } from "@tabler/icons-react";

interface InstagramPost {
  id: number;
  image: string;
  likes: number;
  comments: number;
  caption: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&q=80",
    likes: 234,
    comments: 18,
    caption: "Premium English Willow 🏏",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80",
    likes: 189,
    comments: 12,
    caption: "Match day essentials ⚾",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400&q=80",
    likes: 312,
    comments: 24,
    caption: "Quality craftsmanship 🔨",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=80",
    likes: 278,
    comments: 21,
    caption: "Game ready gear 💪",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80",
    likes: 156,
    comments: 9,
    caption: "New arrivals in stock! 📦",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1578432014316-48b448d79d57?w=400&q=80",
    likes: 421,
    comments: 32,
    caption: "Customer showcase 🌟",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

interface InstagramFeedProps {
  className?: string;
}

export function InstagramFeed({ className }: InstagramFeedProps) {
  return (
    <section className={cn("w-full py-16 px-4 md:px-8 lg:px-20 bg-muted/30", className)}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-2 rounded-full mb-6"
          >
            <IconBrandInstagram className="size-5" />
            <span className="font-semibold">@doabasports</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Follow Us on Instagram
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community and stay updated with the latest products and cricket content
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {instagramPosts.map((post) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/doabasports"
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <motion.img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                {/* Stats */}
                <div className="flex items-center gap-4 text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-1"
                  >
                    <IconHeart className="size-5 fill-white" />
                    <span className="font-semibold">{post.likes}</span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    <IconMessageCircle className="size-5" />
                    <span className="font-semibold">{post.comments}</span>
                  </motion.div>
                </div>

                {/* Caption Preview */}
                <p className="text-white/80 text-xs text-center px-2 line-clamp-2">
                  {post.caption}
                </p>
              </motion.div>

              {/* Instagram gradient border on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  padding: "2px",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />
            </motion.a>
          ))}
        </motion.div>

        {/* Follow Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Button
            asChild
            size="lg"
            className="bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white border-0 gap-2"
          >
            <a
              href="https://instagram.com/doabasports"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandInstagram className="size-5" />
              Follow @doabasports
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
