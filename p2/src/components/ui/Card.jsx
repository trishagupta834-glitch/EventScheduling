import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverEffect = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
