import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-20 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Sketch ideas.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Build together.
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          The simplest way to turn your ideas into visual stories. Draw, annotate, and collaborate with your team in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-lg font-bold text-xl shadow-lg transition-all duration-200 flex items-center justify-center">
            Start Creating
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </div>
      {/* Subtle background illustration */}
      <div className="absolute left-0 top-0 w-80 h-80 bg-purple-200 rounded-full opacity-30 blur-3xl -z-10" style={{ filter: 'blur(80px)' }}></div>
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-pink-200 rounded-full opacity-20 blur-3xl -z-10" style={{ filter: 'blur(100px)' }}></div>
    </section>
  );
} 