'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from "@/components/auth/login-form"

const images = ['/hero-bg1.jpg', '/hero-bg2.jpg', '/hero-bg3.jpg'];

export default function LoginPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#e8e8e3] flex items-center justify-center p-4 sm:p-8">
      
      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden lg:grid lg:grid-cols-2 min-h-[750px] border border-white">
        
        {/* Left Side - Form Area */}
        <div className="flex flex-col justify-center py-12 px-8 sm:px-16 lg:px-20 bg-white">
          <div className="w-full max-w-md mx-auto space-y-10">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛋️</span>
              <h1 className="text-2xl font-extrabold text-zinc-900">Furniture</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-zinc-900">
                Sign In
              </h2>
              <p className="text-zinc-500 font-medium">
                Sign in to continue your shopping experience.
              </p>
            </div>
            
            {/* Real Clean LoginForm Component Import */}
            <LoginForm />
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
            
            {/* Dynamic Pagination Lines */}
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

            {/* Testimonial Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl text-white shadow-2xl z-10">
              <p className="text-lg font-medium leading-relaxed mb-6">
                "I was impressed by how seamless the shopping experience was. The product quality and delivery speed exceeded my expectations."
              </p>
              <div>
                <p className="font-bold text-base">Prabodha Fernando</p>
                <p className="text-sm text-zinc-300">Interior Styling Consultant</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}