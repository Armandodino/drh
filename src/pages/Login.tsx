import React, { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(id, password);
      if (data.token) {
        localStorage.setItem('drh_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        onLogin();
        toast.success(`Bienvenue, ${data.user.nom}`);
        navigate('/');
      } else {
        toast.error(data.message || "Accès non autorisé");
      }
    } catch (err) {
      toast.error("Serveur indisponible ou identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/login-bg.png"
          alt="Background"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-slate-900/50" />
      </div>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xs mx-4"
      >
        {/* Glass Container */}
        <div className="relative">
          {/* Glow behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-white/10 to-emerald-500/20 rounded-2xl blur-xl" />

          {/* Main glass card */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

            <div className="p-5">
              {/* Logo */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-2 border border-white/30 shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h1 className="text-lg font-bold text-white">
                  DRH <span className="text-emerald-400">Yopougon</span>
                </h1>
                <p className="text-white/50 text-[10px]">Mairie de Yopougon</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Matricule */}
                <div>
                  <label className="block text-[10px] font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-sm"
                    placeholder="nom d'utilisateur"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-semibold text-white/70 mb-1 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-2 pr-9 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-3 bg-gradient-to-r from-orange-500 to-emerald-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="text-white/40 text-[10px]">
                  Accès restreint au personnel autorisé
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/40 text-[10px] mt-3">
          © {new Date().getFullYear()} Commune de Yopougon
        </p>
      </motion.div>
    </div>
  );
};
