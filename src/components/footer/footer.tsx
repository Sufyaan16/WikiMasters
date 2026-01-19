import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const productLinks = [
    { href: "/products/cricket", label: "Cricket Equipment" },
    { href: "/products/football", label: "English Willow Bats" },
    { href: "/products/badminton", label: "Sports Gear" },
    { href: "/products/tennis", label: "Accessories" },
  ];

  const accessoryLinks = [
    { href: "/accessories/bags", label: "Cricket Bats" },
    { href: "/accessories/shoes", label: "English Willow Bats" },
    { href: "/accessories/apparel", label: "Sportswear" },
    { href: "/accessories/protective", label: "Cricket Accessories" },
  ];

  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DS</span>
              </div>
              <h3 className="text-white font-bold text-2xl">Doaba Sports</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted partner for quality sports <br /> equipment and
              cricket bats accessories <br /> since 1995.
            </p>
          </div>

          {/* Products Section */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Products</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Accessories Section */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Accessories
            </h4>
            <ul className="space-y-2">
              {accessoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Sports Avenue
                  <br />
                  Rahim Yar Khan, Punjab
                  <br />
                  Pakistan
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  info@doabasports.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Doaba Sports. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
