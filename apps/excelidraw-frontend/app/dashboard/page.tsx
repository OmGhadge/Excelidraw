"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Trash2, ExternalLink } from "lucide-react";
import { BACKEND_URL } from "@/config";

interface Design {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogout() {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/signin");
  }

  // Check login status and fetch designs on mount
  useEffect(() => {
    async function checkAndFetch() {
      setLoading(true);
      setError("");
      try {
        // Check login status
        const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!meRes.ok) {
          router.push("/signin");
          return;
        }
        // Fetch designs
        const res = await fetch(`${BACKEND_URL}/api/designs`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch designs");
        setDesigns(data.designs);
      } catch (err: unknown) {
        setError((err instanceof Error ? err.message : "Failed to fetch designs"));
      } finally {
        setLoading(false);
      }
    }
    checkAndFetch();
  }, [router]);

  // Create new design
  async function handleCreate() {
    const name = prompt("Enter a name for your new design:");
    if (!name) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/designs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create design");
      router.push(`/canvas/${data.design.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create design");
    }
  }

  // Open design
  function handleOpen(id: number) {
    router.push(`/canvas/${id}`);
  }

  // Delete design
  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this design?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/designs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete design");
      setDesigns(designs.filter(d => d.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete design");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-800">SketchFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200">Home</Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Designs</h1>
          <button
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            onClick={handleCreate}
          >
            <Plus className="w-5 h-5" />
            New Design
          </button>
        </div>
        {loading && <div className="text-lg text-gray-500">Loading...</div>}
        {error && <div className="text-red-600 font-medium mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {designs.map(design => (
            <div key={design.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between group transition-transform duration-200 hover:scale-[1.02]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-lg text-gray-800 group-hover:text-purple-600 transition-colors duration-200">{design.name}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">Created: {new Date(design.createdAt).toLocaleString()}</div>
                <div className="text-xs text-gray-400 mb-4">Updated: {new Date(design.updatedAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  onClick={() => handleOpen(design.id)}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                  onClick={() => handleDelete(design.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {(!loading && designs.length === 0) && (
          <div className="flex flex-col items-center justify-center mt-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Pencil className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-semibold text-gray-700 mb-2">No designs yet</div>
            <div className="text-gray-500 mb-4">Create your first design to get started!</div>
            <button
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              onClick={handleCreate}
            >
              <Plus className="w-5 h-5" />
              New Design
            </button>
          </div>
        )}
      </main>
    </div>
  );
}