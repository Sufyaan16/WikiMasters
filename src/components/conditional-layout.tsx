"use client";

import { usePathname } from "next/navigation";
import { FeaturesSection } from "@/components/features-section";
import {
  CONTACT_LINKS,
  EcommerceFooter1,
  FOOTER_LINKS,
  NEWSLETTER_DATA,
} from "@/components/ecommerce-footer1";

export function ConditionalLayout({ 
  children, 
  navbar 
}: { 
  children: React.ReactNode;
  navbar: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && navbar}
      {children}
      {!isAdminRoute && (
        <>
          <FeaturesSection />
          <EcommerceFooter1
            newsletter={NEWSLETTER_DATA}
            footerLinks={FOOTER_LINKS}
            contactLinks={CONTACT_LINKS}
          />
        </>
      )}
    </>
  );
}
