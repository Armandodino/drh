import React, { useState } from 'react';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen flex items-stretch w-full overflow-hidden">

      {/* ── Panneau gauche : Image de fond ── */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        {/* Image */}
        <img
          src="/mairie_yopougon.jpg"
          alt="Mairie de Yopougon"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent" />
        {/* Overlay couleurs CI */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white/80 to-emerald-500" />

        {/* Contenu sur l'image */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Haut */}
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-white font-black text-sm uppercase tracking-widest">Mairie de Yopougon</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <h1 className="text-5xl font-black text-white leading-tight mb-4">
                Gestion du
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-emerald-400">
                  Personnel
                </span>
              </h1>
              <p className="text-slate-300 text-base max-w-sm leading-relaxed">
                Système de gestion des ressources humaines de la Commune de Yopougon.
              </p>
            </motion.div>
          </div>

          {/* Bas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {['Gestion des congés', 'Suivi des agents', 'Notes de service', 'Statistiques RH'].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {feat}
              </div>
            ))}
            <p className="text-slate-500 text-xs mt-4 pt-4 border-t border-white/10">
              © {new Date().getFullYear()} Commune de Yopougon — Tous droits réservés
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Panneau droit : Formulaire ── */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 relative">
        {/* Orbes décoratifs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bandeau couleurs CI (mobile) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white/60 to-emerald-500 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-emerald-600 p-0.5 rounded-2xl mx-auto mb-4">
              <div className="w-full h-full bg-slate-900 rounded-[1rem] flex items-center justify-center text-white">
                <ShieldCheck size={30} />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Mairie de Yopougon</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Connexion</h2>
            <p className="text-slate-500 text-sm mt-1">Accédez à votre espace DRH</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Identifiant / Matricule
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all font-medium text-sm placeholder:text-slate-600"
                placeholder="Ex: drh001"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all font-medium text-sm placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/30 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z" />
                  </svg>
                  Vérification...
                </span>
              ) : (
                <><LogIn size={16} /> Accéder au Système</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-2 justify-center text-slate-600 text-[10px] font-bold uppercase">
            <AlertCircle size={11} />
            Accès restreint au personnel autorisé
          </div>
        </motion.div>
      </div>
    </div>
  );
};