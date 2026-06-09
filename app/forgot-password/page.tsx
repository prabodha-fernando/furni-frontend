'use client'

import { useState, useEffect } from 'react'
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

const images = ['/hero-bg3.jpg', '/hero-bg1.jpg', '/hero-bg2.jpg']; // Variety ekak ganna image order eka maaru kala

export default function ForgotPasswordPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#e8e8e3] flex items-center justify-center p-4 sm:p-8">
      
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden lg:grid lg:grid-cols-2 min-h-[750px] border border-white">
        
        {/* Left Side - Form Area */}
        <div className="flex flex-col justify-center py-12 px-8 sm:px-16 lg:px-20 bg-white">
          <div className="w-full max-w-md mx-auto space-y-8">
            
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛋️</span>
              <h1 className="text-2xl font-extrabold text-zinc-900">Furniture</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-zinc-900">Forgot Password?</h2>
              <p className="text-zinc-500 font-medium">
                No worries, enter your email and we'll send you a link to reset it.
              </p>
            </div>
            
            <ForgotPasswordForm />
          </div>
        </div>

        {/* Right Side - Auto-sliding Hero Banner */}
        <div className="hidden lg:block relative p-4">
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-inner bg-zinc-900">
            
            {images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Interior Design ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="absolute top-6 left-8 right-8 flex gap-2 z-10">
              {images.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentIndex ? "bg-[#f8cd68] w-1/4" : "bg-white/40 w-1/4"
                  }`}
                ></div>
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-white shadow-2xl z-10">
              <p className="text-lg font-medium leading-relaxed mb-6">
                "Your home should tell the story of who you are, and be a collection of what you love."
              </p>
              <div>
                <p className="font-bold text-base">Prabodha Fernando</p>
                <p className="text-sm text-zinc-300">Design Specialist</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}