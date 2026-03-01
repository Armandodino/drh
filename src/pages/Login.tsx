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
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/login-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Glass effect container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

          {/* Content */}
          <div className="p-6">
            {/* Logo */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mb-3 border border-slate-100">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-slate-800">
                DRH <span className="text-emerald-600">Yopougon</span>
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">Mairie de Yopougon</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Matricule */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Matricule
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="Ex: drh001"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-orange-500 to-emerald-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 shadow-lg"
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
                    <LogIn size={16} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs">
                Accès restreint au personnel autorisé
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-white/60 text-xs mt-4">
          © {new Date().getFullYear()} Commune de Yopougon
        </p>
      </motion.div>
    </div>
  );
};
