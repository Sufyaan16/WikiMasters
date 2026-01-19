import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/nav/nav-bar";
import { EcommerceFooter1 , NEWSLETTER_DATA, FOOTER_LINKS, CONTACT_LINKS } from "@/components/ecommerce-footer1";

// import {
//   Sidebar,
//   SidebarProvider,
//   SidebarTrigger,
//   SidebarContent,
//   SidebarFooter,
// } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doaba Sports",
  description: "Learn how to build and scale Next.js apps with Brian Holt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <NavBar />
            {/* <SidebarProvider>
              <AppSidebar  />
              <main className="flex-1 w-full">
              <SidebarTrigger />
              </main>
              </SidebarProvider> */}
            {children}
            <EcommerceFooter1 newsletter={NEWSLETTER_DATA} footerLinks={FOOTER_LINKS} contactLinks={CONTACT_LINKS} />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
