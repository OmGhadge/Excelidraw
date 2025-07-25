import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-800">SketchFlow</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200">Features</a>
            <Link href="/signin" className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200">Sign In</Link>
            <Link href="/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">Sign Up</Link>
          </nav>
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-6 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 font-medium">Features</a>
            <Link href="/signin" className="block text-purple-600 font-medium">Sign In</Link>
            <Link href="/signup" className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
} 