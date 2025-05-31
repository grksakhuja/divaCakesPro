import { Link } from "wouter";
import { Cake, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                <Cake className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Sugar Art Diva</span>
            </div>
            <p className="text-gray-400">
              Creating sweet memories, one cake at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/order" className="hover:text-white transition">
                  Order Now
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                (555) 123-4567
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                hello@sugarartdiva.com
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                123 Bakery St, Sweet City
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Sugar Art Diva. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}