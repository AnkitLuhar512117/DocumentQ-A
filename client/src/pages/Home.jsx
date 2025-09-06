import React from "react";
import { motion } from "framer-motion";
import logo from "../components/logo.jpg";
import DropBox from "../components/DropBox";

const Home = () => {
  return (
    <div className="min-h-screen w-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated colorful background shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        className="absolute -top-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
        className="absolute -top-20 right-20 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* Logo and welcome text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center space-y-4 z-10"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-32 h-32 object-contain rounded-full border-4 border-gray-200 shadow-lg"
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-gray-800 text-3xl md:text-4xl font-bold text-center"
        >
          Welcome to Our Platform
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="text-gray-600 text-lg md:text-xl text-center max-w-lg"
        >
          Effortlessly upload and chat with your PDFs in seconds.
        </motion.p>
      </motion.div>

      {/* DropBox section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-12 z-10 w-full max-w-md"
      >
        <DropBox />
      </motion.div>
    </div>
  );
};

export default Home;
