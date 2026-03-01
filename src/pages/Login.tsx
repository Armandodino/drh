import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center w-full overflow-hidden relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/login-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glass Card */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-emerald-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-75" />
          
          {/* Main glass container */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

            <div className="p-8 md:p-10">
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center mb-8"
              >
                {/* Logo container with glow */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-emerald-400 rounded-2xl blur-lg opacity-50" />
                  <div className="relative w-20 h-20 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border border-white/50">
                    <img 
                      src="/logo.png" 
                      alt="Logo Mairie" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>
                
                <h1 className="text-2xl font-black text-white tracking-tight text-center">
                  DRH <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-emerald-400">Yopougon</span>
                </h1>
                <p className="text-white/60 text-sm mt-1">Direction des Ressources Humaines</p>
              </motion.div>

              {/* Welcome text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h2 className="text-xl font-bold text-white mb-1">Connexion</h2>
                <p className="text-white/50 text-sm">Accédez à votre espace sécurisé</p>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Matricule Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Matricule
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-white/40">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
                        placeholder="Entrez votre matricule"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-white/40">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
                        placeholder="Entrez votre mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full group mt-6"
                >
                  {/* Button glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-emerald-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  
                  <div className="relative w-full py-4 bg-gradient-to-r from-orange-500 to-emerald-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-60 transition-all">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Vérification...
                      </span>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Se connecter
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.form>

              {/* Footer info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-white/10 text-center"
              >
                <p className="text-white/40 text-xs">
                  🔒 Accès restreint au personnel autorisé
                </p>
                <p className="text-white/30 text-[10px] mt-2">
                  © {new Date().getFullYear()} Commune de Yopougon — Tous droits réservés
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
