import React from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const GiftSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          >
            <Gift className="w-8 h-8 text-emerald-600" />
            <CheckCircle className="w-5 h-5 text-emerald-600 absolute -top-1 -right-1 bg-white rounded-full" />
          </motion.div>
          
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">
            Gift Sent Successfully!
          </h1>
          
          <p className="text-stone-600 mb-8">
            Your gift subscription has been purchased! The recipient will receive an email with their gift details and delivery information.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/gift"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Gift className="w-4 h-4" />
              Send Another Gift
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/"
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GiftSuccess;