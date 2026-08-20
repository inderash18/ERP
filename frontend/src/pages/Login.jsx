import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Building, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate a network request for the demo
    setTimeout(() => {
      // Set a dummy token to bypass the auth check
      localStorage.setItem('token', 'demo-token');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[128px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[128px] rounded-full mix-blend-screen pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <Building className="text-zinc-950" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Welcome Back</h1>
          <p className="text-zinc-400">Sign in to your manufacturing workspace</p>
        </div>

        <form onSubmit={handleDemoLogin} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="email"
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-50 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-4 pl-12 transition-colors placeholder:text-zinc-600"
                placeholder="admin@example.com"
                defaultValue="admin@demo.com"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 text-zinc-50 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-4 pl-12 transition-colors placeholder:text-zinc-600"
                placeholder="••••••••"
                defaultValue="password123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-zinc-950 bg-emerald-500 hover:bg-emerald-400 focus:ring-4 focus:outline-none focus:ring-emerald-500/50 font-bold rounded-xl text-base px-5 py-4 text-center flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">
            Don't have an account?{' '}
            <a href="#" className="text-emerald-400 hover:underline">
              Contact Sales
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
