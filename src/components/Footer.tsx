import React from 'react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="font-serif text-2xl font-bold text-white tracking-tight mb-6">
              Lumë <span className="text-emerald-500 font-light">Refillery</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Connecting communities through sustainable food systems. We believe in transparent pricing, fair wages for farmers, and healthy food for everyone.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-stone-400 hover:text-emerald-400 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-stone-400 hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-stone-400 hover:text-emerald-400 transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/sample-hauls" className="hover:text-emerald-400 transition-colors">Essential Haul</Link></li>
              <li><Link to="/sample-hauls" className="hover:text-emerald-400 transition-colors">Household Haul</Link></li>
              <li><Link to="/sample-hauls" className="hover:text-emerald-400 transition-colors">Supported Haul</Link></li>
              <li><Link to="/gift" className="hover:text-emerald-400 transition-colors">Gift a Subscription</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/our-mission" className="hover:text-emerald-400 transition-colors">Our Mission</Link></li>
              <li><Link to="/sustainability" className="hover:text-emerald-400 transition-colors">Sustainability Statement</Link></li>
              <li><Link to="/sourcing-standards" className="hover:text-emerald-400 transition-colors">Sourcing Standards</Link></li>
              {/* <li><Link to="/impact-report" className="hover:text-emerald-400 transition-colors">Impact Report</Link></li> */}
              {/* <li><Link to="/careers" className="hover:text-emerald-400 transition-colors">Careers</Link></li> */}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Trinidad & Tobago</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <a href="tel:+18687866360" className="hover:text-emerald-400 transition-colors">+1 (868) 786-6360</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <a href="mailto:lumestudiott@gmail.com" className="hover:text-emerald-400 transition-colors">lumestudiott@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Lumë Refillery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;