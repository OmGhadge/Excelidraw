import { Users, Share2, Layers, Pencil, Sparkles } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need for collaborative design
          </h2>
          <p className="text-lg text-gray-600">
            SketchFlow is built for teams and creators who want to brainstorm, design, and share ideas visually—together.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Users className="w-14 h-14 text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Collaboration</h3>
            <p className="text-gray-600 leading-relaxed">Work together with your team on the same canvas, see changes live, and never miss an update.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Share2 className="w-14 h-14 text-pink-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Shareable Links</h3>
            <p className="text-gray-600 leading-relaxed">Invite others with edit or read-only links. Collaborate or present your designs securely.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Layers className="w-14 h-14 text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Design Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">Create, save, and manage all your designs in one place. Organize your creative work effortlessly.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Pencil className="w-14 h-14 text-yellow-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Drawing Tools</h3>
            <p className="text-gray-600 leading-relaxed">Draw rectangles, circles, lines, arrows, text, and erase with intuitive, easy-to-use tools.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Users className="w-14 h-14 text-green-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Avatars & Presence</h3>
            <p className="text-gray-600 leading-relaxed">See who’s collaborating with you in real-time. User avatars and presence indicators keep everyone in sync.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group">
            <Sparkles className="w-14 h-14 text-gray-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Security</h3>
            <p className="text-gray-600 leading-relaxed">Your designs are private and secure. Only those you invite can view or edit your work.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 