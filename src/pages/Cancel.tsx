import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cancel: React.FC = () => {
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
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-stone-600 mb-8">
            Your payment was cancelled. No charges were made to your account. You can try again anytime.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            
            <Link
              to="/"
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cancel;