import React from 'react';
import { Crown, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';
// The current year is 2026, so the copyright should reflect that.
const Footer = () => {
  return (
    <footer className="bg-richBlack text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="text-softGold" size={32} />
              <span className="text-2xl font-luxury font-bold tracking-tight">
                Royal <span className="text-softGold">Purple</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Curating unforgettable luxury experiences for the world's most discerning clientele. From private galas to global product launches.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-softGold">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Client Testimonials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-softGold">Contact Info</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-softGold" />
                123 Luxury Ave, Mayfair, London
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-softGold" />
                +44 20 7946 0000
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-softGold" />
                concierge@royalpurple.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-softGold">Newsletter</h4>
            <p className="text-gray-400 mb-4">Join our inner circle for exclusive event invites.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-softGold"
              />
              <button className="bg-softGold text-richBlack px-4 py-2 rounded-lg font-bold hover:bg-mutedGold transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2023 Royal Purple Luxury Events. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Instagram size={20} className="text-gray-400 hover:text-softGold cursor-pointer transition-colors" />
            <Twitter size={20} className="text-gray-400 hover:text-softGold cursor-pointer transition-colors" />
            <Facebook size={20} className="text-gray-400 hover:text-softGold cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
