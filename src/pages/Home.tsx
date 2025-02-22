import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle, Lock, Users, Book, Clock, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const mobileMenuVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { opacity: 0, x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      
      <div className="h-5" />
      <motion.header
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md rounded-full mx-4 md:mx-auto max-w-screen-md"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-xl font-bold">ProctorAI</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-full bg-white text-indigo-600 hover:bg-gray-100 transition-colors duration-200">Register</Link>
            </nav>

            <button
              className={`md:hidden p-2 rounded-lg hover:bg-indigo-700 transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.header>
      

      <AnimatePresence>
        {isMenuOpen && (
          <motion.header
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md rounded-full mx-4 md:hidden mt-4 md:mt-0 max-w-screen-md"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center h-16">
                
                <nav className="md:hidden flex items-center space-x-4">
                  <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
                  <Link to="/register" className="px-4 py-2 rounded-full bg-white text-indigo-600 hover:bg-gray-100 transition-colors duration-200">Register</Link>
                </nav>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Shield className="w-16 h-16 text-indigo-600" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
            ProctorAI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered exam proctoring system for secure and reliable online assessments
          </p>
          {/* Call to Action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-200 mt-10"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Key Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-start mb-4">
              <Lock className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Secure Proctoring</h2>
            </div>
            <p className="text-gray-700">
              Ensure the integrity of your exams with advanced AI-powered proctoring.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-start mb-4">
              <Clock className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Real-Time Monitoring</h2>
            </div>
            <p className="text-gray-700">
              Monitor student activity in real-time to prevent cheating and ensure a fair testing environment.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-start mb-4">
              <Book className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Detailed Reports</h2>
            </div>
            <p className="text-gray-700">
              Generate comprehensive reports and analytics to improve your assessment strategies.
            </p>
          </motion.div>
        </div>

        {/* User Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">For Educators</h2>
            <ul className="space-y-4">
              {[
                'Create and manage online assessments',
                'Real-time monitoring of student activity',
                'AI-powered cheating prevention',
                'Comprehensive analytics and reports'
              ].map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center space-x-3 text-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">For Students</h2>
            <ul className="space-y-4">
              {[
                'Seamless exam experience',
                'Fair and secure testing environment',
                'Real-time technical support',
                'Instant feedback and results'
              ].map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center space-x-3 text-gray-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
