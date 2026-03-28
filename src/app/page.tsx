'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';
import {
  Bell,
  Settings,
  LogOut,
  FileText,
  Calendar,
  Users,
  Home,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Building2,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  Edit2,
  Trash2,
  User,
  Briefcase,
  Phone,
  Mail,
  History,
  ChevronDown,
  ChevronUp,
  Info,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Directions disponibles
const DIRECTIONS = [
  "Direction des Ressources Humaines",
  "Direction des Affaires Juridiques et Contentieux",
  "Direction des services administratifs, état civil et population",
  "Direction des services techniques",
  "Direction des projets d'infrastructure",
  "Direction économique et financière",
  "Direction du Recouvrement et de la régie des taxes",
  "Direction de la Communication",
  "Direction de la Police Municipale et Ordre Public",
  "Direction du Développement humain",
  "Direction des Systèmes d'Information"
];

// ============================================
// TYPES
// ============================================
interface Employe {
  id: number;
  matricule: string;
  nom: string;
  prenoms: string;
  sexe: string;
  direction: string;
  fonction: string | null;
  telephone: string | null;
  email: string | null;
  statut: string;
  joursCongeAnnuel: number;
  joursPrisHistorique: number;
  dateEmbauche: string | null;
  role: string;
}

interface Conge {
  id: number;
  employe_id: number;
  nom: string;
  prenoms: string;
  matricule: string;
  fonction: string;
  direction: string;
  date_depart: string;
  date_retour: string;
  nombre_jours: number;
  type: string;
  motif: string;
  statut: string;
}

interface ChoixConge {
  id: number;
  employeId: number;
  nom: string;
  prenoms: string;
  matricule: string;
  direction: string;
  fonction: string;
  dateDepartSouhaitee: string;
  dateRetourSouhaitee: string;
  nombreJours: number;
  statut: string;
  annee: number;
}

interface UserData {
  nom: string;
  prenoms: string;
  role: string;
  matricule: string;
}

// ============================================
// API SERVICE
// ============================================
const api = {
  login: async (matricule: string, password: string) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricule, password }),
    });
    return res.json();
  },

  getAgents: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/agents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  addAgent: async (data: Partial<Employe>) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateAgent: async (id: number, data: Partial<Employe>) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteAgent: async (id: number, password: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  getConges: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/conges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  addConge: async (data: Record<string, unknown>) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/conges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCongeStatus: async (id: number, statut: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/conges/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ statut }),
    });
    return res.json();
  },

  verifyPassword: async (password: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  getNotificationsCount: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/notifications/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getCongesFinProche: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/conges/fin-proche`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getChoixConges: async (annee: number) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/choix-conges?annee=${annee}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
};

// ============================================
// PDF GENERATION
// ============================================
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getVeille = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDate(date.toISOString().split('T')[0]);
};

const generateArreteDeService = (conge: Conge) => {
  const now = new Date();
  const annee = now.getFullYear();
  const numero = String(now.getTime()).slice(-6);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Arrêté N° ${numero}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.6; color: #000; max-width: 21cm; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    .republique { font-size: 11pt; font-weight: bold; margin-bottom: 5px; }
    .mairie { font-size: 16pt; font-weight: bold; margin-bottom: 5px; }
    .direction { font-size: 12pt; font-weight: bold; }
    .title { text-align: center; margin: 30px 0; }
    .arrete-title { font-size: 18pt; font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
    .numero { font-size: 14pt; font-weight: bold; }
    .content { text-align: justify; margin: 20px 0; }
    .article { margin: 15px 0; }
    .article-num { font-weight: bold; }
    .highlight { font-weight: bold; }
    .signature { margin-top: 60px; text-align: right; padding-right: 50px; }
    .signature-title { font-weight: bold; margin-top: 60px; }
    .note { font-size: 12pt; font-style: italic; margin-top: 30px; padding: 10px; background: #f0f0f0; border-left: 4px solid #333; }
  </style>
</head>
<body>
  <div class="header">
    <p class="republique">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
    <p style="font-size: 10pt; color: #666;">Union - Discipline - Travail</p>
    <p class="mairie">MAIRIE DE YOPOUGON</p>
    <p class="direction">DIRECTION DES RESSOURCES HUMAINES</p>
  </div>
  <div class="title">
    <p class="arrete-title">ARRÊTÉ DE SERVICE</p>
    <p class="numero">N° ${numero}/DRH/MY/${annee}</p>
  </div>
  <div class="content">
    <p class="article"><span class="article-num">LE MAIRE DE YOPOUGON,</span></p>
    <p class="article">Vu la Constitution du 08 Novembre 2016 ;<br>Vu la loi n° 2019-572 du 26 juin 2019 portant statut général de la fonction publique ;<br>Vu le décret n° 2012-1115 du 14 novembre 2012 portant création et organisation de la Commune de Yopougon ;</p>
    <p class="article"><span class="article-num">ARRÊTE</span></p>
    <p class="article"><span class="article-num">Article 1 :</span> Est autorisé(e) à bénéficier d'un congé ${conge.type?.toLowerCase() || 'annuel'}, <span class="highlight">${conge.nom} ${conge.prenoms}</span>, <span class="highlight">${conge.fonction || 'Agent'}</span>, matricule <span class="highlight">${conge.matricule}</span>, affecté(e) à la <span class="highlight">${conge.direction || 'Non spécifiée'}</span>.</p>
    <p class="article"><span class="article-num">Article 2 :</span> Ce congé est accordé pour une durée de <span class="highlight">${conge.nombre_jours} jours</span> du <span class="highlight">${formatDate(conge.date_depart)}</span> au <span class="highlight">${formatDate(conge.date_retour)}</span>.</p>
    <p class="article"><span class="article-num">Article 3 :</span> L'intéressé(e) est tenu(e) de prendre son arrêté de service le <span class="highlight">${getVeille(conge.date_depart)}</span>, veille du départ en congé.</p>
    <p class="article"><span class="article-num">Article 4 :</span> L'intéressé(e) reprendra son service à compter du <span class="highlight">${formatDate(conge.date_retour)}</span>.</p>
    <p class="article"><span class="article-num">Article 5 :</span> Le présent arrêté sera enregistré et notifié à l'intéressé(e) qui en accusera réception.</p>
  </div>
  <div class="signature">
    <p>Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
    <p class="signature-title">LE MAIRE DE YOPOUGON</p>
  </div>
  <div class="note">
    <strong>NOTE IMPORTANTE :</strong> Cet arrêté doit être retiré la veille du départ en congé (soit le ${getVeille(conge.date_depart)}), pendant les heures de travail, auprès de la Direction des Ressources Humaines.
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
};

const generateNoteReprise = (conge: Conge) => {
  const now = new Date();
  const annee = now.getFullYear();
  const numero = String(now.getTime()).slice(-6);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Note de Reprise - ${conge.nom} ${conge.prenoms}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.6; color: #000; max-width: 21cm; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    .republique { font-size: 11pt; font-weight: bold; margin-bottom: 5px; }
    .mairie { font-size: 16pt; font-weight: bold; margin-bottom: 5px; }
    .direction { font-size: 12pt; font-weight: bold; }
    .title { text-align: center; margin: 30px 0; }
    .note-title { font-size: 18pt; font-weight: bold; text-decoration: underline; margin-bottom: 10px; color: #166534; }
    .numero { font-size: 14pt; font-weight: bold; }
    .content { text-align: justify; margin: 20px 0; }
    .article { margin: 15px 0; }
    .article-num { font-weight: bold; }
    .highlight { font-weight: bold; color: #166534; }
    .signature { margin-top: 60px; text-align: right; padding-right: 50px; }
    .signature-title { font-weight: bold; margin-top: 60px; }
    .success-box { background: #dcfce7; border: 2px solid #166534; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <p class="republique">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
    <p style="font-size: 10pt; color: #666;">Union - Discipline - Travail</p>
    <p class="mairie">MAIRIE DE YOPOUGON</p>
    <p class="direction">DIRECTION DES RESSOURCES HUMAINES</p>
  </div>
  <div class="title">
    <p class="note-title">NOTE DE REPRISE DE SERVICE</p>
    <p class="numero">N° ${numero}/DRH/MY/${annee}</p>
  </div>
  <div class="success-box">
    <p style="font-size: 14pt; font-weight: bold; color: #166534;">✓ CERTIFICAT DE REPRISE DE SERVICE</p>
  </div>
  <div class="content">
    <p class="article">Je soussigné(e), <span class="highlight">Le Directeur des Ressources Humaines</span> de la Mairie de Yopougon,</p>
    <p class="article"><span class="article-num">CERTIFIE</span> que :</p>
    <p class="article"><span class="highlight">${conge.nom} ${conge.prenoms}</span>, <span class="highlight">${conge.fonction || 'Agent'}</span>, matricule <span class="highlight">${conge.matricule}</span>, affecté(e) à la <span class="highlight">${conge.direction || 'Non spécifiée'}</span>,</p>
    <p class="article">A bénéficié d'un congé ${conge.type?.toLowerCase() || 'annuel'} du <span class="highlight">${formatDate(conge.date_depart)}</span> au <span class="highlight">${formatDate(conge.date_retour)}</span>, soit une durée de <span class="highlight">${conge.nombre_jours} jours</span>.</p>
    <p class="article"><span class="article-num">ATTESTE</span> que l'intéressé(e) a <span class="highlight">REPRI SES FONCTIONS</span> ce jour, conformément aux dispositions réglementaires en vigueur.</p>
    <p class="article">La présente note est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
  </div>
  <div class="signature">
    <p>Fait à Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
    <p class="signature-title">LE DIRECTEUR DES RESSOURCES HUMAINES</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  }
};

// ============================================
// SPLASH SCREEN COMPONENT
// ============================================
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      { target: 30, delay: 200 },
      { target: 60, delay: 500 },
      { target: 85, delay: 900 },
      { target: 100, delay: 1400 },
    ];

    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });

    setTimeout(() => onComplete(), 2000);
  }, [onComplete]);

  const checks = [
    { label: 'Connexion au serveur', done: progress >= 30 },
    { label: 'Chargement des données', done: progress >= 60 },
    { label: 'Initialisation', done: progress >= 85 },
    { label: 'Prêt', done: progress >= 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
    >
      <img
        src="/mairie_yopougon.jpg"
        alt="Mairie"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm w-full">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white tracking-tight mb-1"
        >
          DRH<span className="text-emerald-400">·YOP</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-xs uppercase tracking-widest font-bold"
        >
          Mairie de Yopougon
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full mt-12 space-y-3">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.done ? 'bg-emerald-500' : 'border border-slate-600'}`}>
                {check.done && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={check.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>{check.label}</span>
            </div>
          ))}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// AGENT FORM COMPONENT
// ============================================
const AgentForm = ({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenoms: '',
    sexe: 'M',
    direction: DIRECTIONS[0],
    fonction: '',
    telephone: '',
    email: '',
    date_embauche: '',
    jours_pris_historique: 0
  });

  const calculerCongesAcquis = () => {
    if (!formData.date_embauche) return { annees: 0, acquis: 0 };
    const embauche = new Date(formData.date_embauche);
    const today = new Date();
    const annees = Math.floor((today.getTime() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return { annees, acquis: annees * 30 };
  };

  const { annees, acquis } = calculerCongesAcquis();

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.nom || !formData.prenoms || !formData.date_embauche) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await api.addAgent(formData);
      toast.success("Agent ajouté avec succès !");
      onSuccess();
      onClose();
      setFormData({
        matricule: '', nom: '', prenoms: '', sexe: 'M',
        direction: DIRECTIONS[0], fonction: '', telephone: '', email: '',
        date_embauche: '', jours_pris_historique: 0
      });
      setStep(1);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Nouvel Agent Municipal</h3>
            <p className="text-emerald-100 text-sm mt-1">Étape {step} sur 2</p>
          </div>
          <div className="h-1 bg-slate-200"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${(step / 2) * 100}%` }} /></div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><User size={12} /> Matricule *</Label>
                    <Input value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value.toLowerCase() })} placeholder="Ex: ag001" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Genre</Label>
                    <select value={formData.sexe} onChange={e => setFormData({ ...formData, sexe: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><Calendar size={12} /> Date d'embauche *</Label>
                    <Input type="date" value={formData.date_embauche} onChange={e => setFormData({ ...formData, date_embauche: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Nom *</Label>
                    <Input value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Prénoms *</Label>
                    <Input value={formData.prenoms} onChange={e => setFormData({ ...formData, prenoms: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><Briefcase size={12} /> Direction *</Label>
                  <select value={formData.direction} onChange={e => setFormData({ ...formData, direction: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                    {DIRECTIONS.map(dir => <option key={dir} value={dir}>{dir}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Fonction</Label>
                    <Input value={formData.fonction} onChange={e => setFormData({ ...formData, fonction: e.target.value })} placeholder="Ex: Chef de service" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><Phone size={12} /> Téléphone</Label>
                    <Input value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} placeholder="07 00 00 00 00" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><Mail size={12} /> Email</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                {formData.date_embauche && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3"><Info size={16} /> Aperçu des droits à congés</div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div><p className="text-2xl font-black text-emerald-600">{annees}</p><p className="text-xs text-slate-500">Années d'ancienneté</p></div>
                      <div><p className="text-2xl font-black text-emerald-600">{acquis}</p><p className="text-xs text-slate-500">Jours acquis (30j/an)</p></div>
                      <div><p className="text-2xl font-black text-emerald-600">{acquis}</p><p className="text-xs text-slate-500">Solde disponible</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <History className="text-amber-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-amber-800">Congés pris avant le système</p>
                      <p className="text-sm text-amber-700 mt-1">Enregistrez ici les congés déjà pris par l'agent depuis son embauche.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-xs text-slate-500 uppercase font-bold">Date d'embauche</p><p className="text-lg font-bold">{formData.date_embauche ? new Date(formData.date_embauche).toLocaleDateString('fr-FR') : '-'}</p></div>
                    <div><p className="text-xs text-slate-500 uppercase font-bold">Jours acquis</p><p className="text-lg font-bold text-emerald-600">{acquis} jours</p></div>
                    <div><p className="text-xs text-slate-500 uppercase font-bold">Ancienneté</p><p className="text-lg font-bold">{annees} an(s)</p></div>
                  </div>
                </div>
                <div className="bg-emerald-600 text-white rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div><p className="text-emerald-100 text-sm">Solde de congés disponible</p></div>
                    <span className="text-3xl font-black">{acquis} jours</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t px-6 py-4 bg-slate-50 flex justify-between">
            <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(step - 1)}>{step === 1 ? 'Annuler' : '← Retour'}</Button>
            {step === 1 ? (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(2)} disabled={!formData.matricule || !formData.nom || !formData.prenoms || !formData.date_embauche}>Suivant →</Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={loading}>{loading ? 'Enregistrement...' : '✓ Créer l\'Agent'}</Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function DRHApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [agents, setAgents] = useState<Employe[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [choixConges, setChoixConges] = useState<ChoixConge[]>([]);
  const [congesFinProche, setCongesFinProche] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Login form
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Modals
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showCongeModal, setShowCongeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<{ type: 'confirm' | 'cancel'; conge: Conge } | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Conge form
  const [congeForm, setCongeForm] = useState({
    employe_id: '',
    date_depart: '',
    duree: '30',
    type: 'Annuel',
    motif: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const [agentsData, congesData, finProcheData, notifData, choixData] = await Promise.all([
        api.getAgents(),
        api.getConges(),
        api.getCongesFinProche(),
        api.getNotificationsCount(),
        api.getChoixConges(selectedYear).catch(() => []),
      ]);
      setAgents(agentsData || []);
      setConges(congesData || []);
      setCongesFinProche(finProcheData || []);
      setNotifCount(notifData.count || 0);
      setChoixConges(choixData || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem('drh_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
        setIsLoggedIn(true);
        setShowSplash(true);
      } catch {
        localStorage.removeItem('drh_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await api.login(matricule, password);
      if (data.token) {
        localStorage.setItem('drh_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setShowSplash(true);
        toast.success(`Bienvenue, ${data.user.nom}`);
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch {
      setLoginError('Erreur de connexion');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('drh_token');
    localStorage.removeItem('user_data');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowSplash(false);
    setActiveView('dashboard');
  };

  // Add conge
  const handleAddConge = async () => {
    if (!congeForm.employe_id || !congeForm.date_depart) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const days = parseInt(congeForm.duree);
    const date_retour = new Date(congeForm.date_depart);
    date_retour.setDate(date_retour.getDate() + days);

    try {
      const result = await api.addConge({
        employe_id: parseInt(congeForm.employe_id),
        date_depart: congeForm.date_depart,
        date_retour: date_retour.toISOString().split('T')[0],
        nombre_jours: days,
        type: congeForm.type,
        motif: congeForm.motif,
      });
      if (result.id) {
        toast.success('Demande de congé enregistrée');
        setShowCongeModal(false);
        setCongeForm({ employe_id: '', date_depart: '', duree: '30', type: 'Annuel', motif: '' });
        fetchData();
      }
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // Handle conge status change with password
  const handleCongeAction = async () => {
    if (!passwordAction) return;
    try {
      const result = await api.verifyPassword(confirmPassword);
      if (!result.valid) {
        toast.error('Mot de passe incorrect');
        return;
      }
      if (passwordAction.type === 'confirm') {
        await api.updateCongeStatus(passwordAction.conge.id, 'Approuvé');
        toast.success('Congé approuvé');
        generateArreteDeService(passwordAction.conge);
      } else {
        await api.updateCongeStatus(passwordAction.conge.id, 'Annulé');
        toast.success('Congé annulé');
      }
      setShowPasswordModal(false);
      setPasswordAction(null);
      setConfirmPassword('');
      fetchData();
    } catch {
      toast.error('Erreur lors de l\'opération');
    }
  };

  // Stats
  const stats = {
    totalAgents: agents.filter(a => a.role === 'AGENT').length,
    demandesAttente: conges.filter(c => c.statut?.toLowerCase().includes('attente')).length,
    congesApprouves: conges.filter(c => c.statut?.toLowerCase().includes('approuve')).length,
  };

  // Solde calculation
  const getSolde = (agent: Employe) => {
    if (!agent.dateEmbauche) return agent.joursCongeAnnuel || 30;
    const hireYear = new Date(agent.dateEmbauche).getFullYear();
    const yearsWorked = new Date().getFullYear() - hireYear + 1;
    const totalEntitled = yearsWorked * (agent.joursCongeAnnuel || 30);
    const used = conges.filter(c => c.employe_id === agent.id && c.statut?.toLowerCase().includes('approuve')).reduce((sum, c) => sum + (c.nombre_jours || 0), 0);
    const historique = agent.joursPrisHistorique || 0;
    return Math.max(0, totalEntitled - used - historique);
  };

  // Status badge
  const getStatusBadge = (statut: string) => {
    const normalized = statut?.toLowerCase().replace('_', ' ');
    if (normalized?.includes('attente')) return <Badge className="bg-amber-100 text-amber-700"><Clock size={12} className="mr-1" /> En attente</Badge>;
    if (normalized?.includes('approuve')) return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle size={12} className="mr-1" /> Approuvé</Badge>;
    if (normalized?.includes('annule')) return <Badge className="bg-red-100 text-red-700"><XCircle size={12} className="mr-1" /> Annulé</Badge>;
    if (normalized?.includes('cours')) return <Badge className="bg-blue-100 text-blue-700"><Clock size={12} className="mr-1" /> En cours</Badge>;
    return <Badge>{statut}</Badge>;
  };

  // Filtered agents
  const filteredAgents = agents.filter(a =>
    a.role === 'AGENT' &&
    (`${a.nom} ${a.prenoms}`.toLowerCase().includes(search.toLowerCase()) ||
      a.matricule?.toLowerCase().includes(search.toLowerCase()) ||
      a.direction?.toLowerCase().includes(search.toLowerCase()))
  );

  // LOGIN PAGE - Background + Form Only
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <img 
          src="/mairie_yopougon.jpg" 
          alt="Mairie de Yopougon" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Form - Centered */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-5 w-16 h-16 bg-gradient-to-br from-orange-500 via-white to-emerald-500 rounded-xl flex items-center justify-center shadow-xl">
                <Building2 className="w-8 h-8 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">
                <span className="text-white">DRH</span>
                <span className="text-emerald-400"> Yopougon</span>
              </h1>
              <p className="text-white/60 text-sm">Direction des Ressources Humaines</p>
            </div>

            {/* Form Card - Solid, no glass */}
            <div className="bg-slate-900 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-semibold text-white text-center mb-6">
                Connexion
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Matricule */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={e => setMatricule(e.target.value)}
                    placeholder="Ex: drh001"
                    className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 px-4 pr-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {loginError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{loginError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all"
                >
                  Se connecter
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SPLASH SCREEN
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // MAIN APPLICATION
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Toaster position="bottom-center" richColors />

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">Mairie de Yopougon</h1>
              <p className="text-xs text-slate-500">Direction des Ressources Humaines</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('notifications')} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {notifCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{notifCount}</span>}
            </button>
            <button className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.nom}</p>
                <p className="text-xs text-slate-500">{currentUser?.role === 'ADMIN_DRH' ? 'Superviseur' : 'Développeur'}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-emerald-500/20">{currentUser?.nom?.charAt(0) || 'A'}</div>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors" title="Se déconnecter"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 hidden lg:block">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'dashboard' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Home size={20} /> Tableau de bord</button>
          <button onClick={() => setActiveView('notifications')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'notifications' ? 'bg-red-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Bell size={20} /> Notifications{congesFinProche.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{congesFinProche.length}</span>}</button>
          <button onClick={() => setActiveView('employees')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'employees' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Users size={20} /> Employés</button>
          <button onClick={() => setActiveView('leaves')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'leaves' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Calendar size={20} /> Congés & Absences</button>
          <button onClick={() => setActiveView('choix-conges')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'choix-conges' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Calendar size={20} /> Planification Annuelle</button>
          <button onClick={() => setActiveView('documents')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeView === 'documents' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><FileText size={20} /> Documents</button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard */}
          {activeView === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord</h2>
                  <p className="text-slate-500 mt-1">Commune de Yopougon — Direction des Ressources Humaines</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-600" /></div><Badge className="bg-emerald-50 text-emerald-500">Global</Badge></div><p className="text-xs text-slate-500 font-semibold uppercase">Total Agents</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalAgents}</p></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-blue-600" /></div><Badge className="bg-blue-50 text-blue-500">Approuvés</Badge></div><p className="text-xs text-slate-500 font-semibold uppercase">Congés Approuvés</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.congesApprouves}</p></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"><Clock className="w-6 h-6 text-orange-600" /></div><Badge className={stats.demandesAttente > 0 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}>À Valider</Badge></div><p className="text-xs text-slate-500 font-semibold uppercase">Demandes en Attente</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.demandesAttente}</p></CardContent></Card>
                <Card><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-purple-600" /></div><Badge className="bg-purple-50 text-purple-500">Cumul</Badge></div><p className="text-xs text-slate-500 font-semibold uppercase">Solde Global</p><p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{agents.reduce((acc, a) => acc + getSolde(a), 0)} <span className="text-xs opacity-50">jours</span></p></CardContent></Card>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Demandes par statut</CardTitle>
                    <CardDescription>Répartition des demandes de congés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const statusData = [
                        { name: 'En attente', value: conges.filter(c => c.statut?.toLowerCase().includes('attente')).length, color: '#f59e0b' },
                        { name: 'Approuvé', value: conges.filter(c => c.statut?.toLowerCase().includes('approuve')).length, color: '#10b981' },
                        { name: 'Refusé', value: conges.filter(c => c.statut?.toLowerCase().includes('refus')).length, color: '#ef4444' },
                        { name: 'Annulé', value: conges.filter(c => c.statut?.toLowerCase().includes('annul')).length, color: '#6b7280' },
                      ].filter(d => d.value > 0);
                      
                      if (statusData.length === 0) {
                        return <p className="text-center text-slate-400 py-8">Aucune donnée</p>;
                      }
                      
                      return (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Type Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Demandes par type</CardTitle>
                    <CardDescription>Répartition par type de congé</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const typeColors = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6', '#8b5cf6'];
                      const typeData = [
                        { name: 'Annuel', value: conges.filter(c => c.type === 'Annuel').length },
                        { name: 'Maladie', value: conges.filter(c => c.type === 'Maladie').length },
                        { name: 'Maternité', value: conges.filter(c => c.type === 'Maternité').length },
                        { name: 'Paternité', value: conges.filter(c => c.type === 'Paternité').length },
                        { name: 'Exceptionnel', value: conges.filter(c => c.type === 'Exceptionnel').length },
                        { name: 'Sans solde', value: conges.filter(c => c.type === 'Sans solde').length },
                      ].filter(d => d.value > 0);
                      
                      if (typeData.length === 0) {
                        return <p className="text-center text-slate-400 py-8">Aucune donnée</p>;
                      }
                      
                      return (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={typeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {typeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={typeColors[index % typeColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              
              {/* Area Chart - Monthly Evolution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Évolution mensuelle ({new Date().getFullYear()})</CardTitle>
                  <CardDescription>Nombre de demandes et jours de congé par mois</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const monthlyData = Array.from({ length: 12 }, (_, i) => {
                      const monthConges = conges.filter(c => {
                        const date = new Date(c.date_depart);
                        return date.getFullYear() === currentYear && date.getMonth() === i;
                      });
                      return {
                        name: new Date(currentYear, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
                        demandes: monthConges.length,
                        jours: monthConges.reduce((sum, c) => sum + (c.nombre_jours || 0), 0),
                      };
                    });
                    
                    return (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="demandes"
                            name="Demandes"
                            stackId="1"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="jours"
                            name="Jours"
                            stackId="2"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle>Demandes Récentes</CardTitle></CardHeader>
                <CardContent>
                  {loading ? <div className="flex items-center justify-center p-12 text-slate-500">Chargement...</div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Employé</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Durée</th><th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Statut</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {conges.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Aucun congé récent</td></tr> : conges.slice(-5).reverse().map(conge => (
                            <tr key={conge.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs">{conge.nom?.charAt(0)}{conge.prenoms?.charAt(0)}</div><div><p className="font-bold text-slate-900 dark:text-white">{conge.nom} {conge.prenoms}</p><p className="text-xs text-slate-400">{conge.direction || 'N/A'}</p></div></div></td>
                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{conge.type || 'Annuel'}</td>
                              <td className="px-6 py-4 text-sm text-slate-500"><span className="font-bold">{conge.nombre_jours}j</span><span className="block text-xs">{new Date(conge.date_depart).toLocaleDateString('fr-FR')} → {new Date(conge.date_retour).toLocaleDateString('fr-FR')}</span></td>
                              <td className="px-6 py-4 text-right">{getStatusBadge(conge.statut)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeView === 'notifications' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Centre de Notifications</h2><p className="text-slate-500 text-sm">Gérez les alertes et les fins de congés</p></div>
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertTriangle size={20} />Congés se terminant bientôt ({congesFinProche.length})</CardTitle></CardHeader>
                <CardContent>
                  {congesFinProche.length === 0 ? <div className="text-center py-8 text-slate-400"><CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" /><p>Aucun congé ne se termine dans les 3 prochains jours</p></div> : (
                    <div className="space-y-4">
                      {congesFinProche.map((conge: any) => (
                        <div key={conge.id} className={`p-4 rounded-xl border-2 ${conge.jours_restants <= 1 ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'}`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${conge.jours_restants <= 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{conge.jours_restants <= 1 ? <AlertTriangle size={24} /> : <Clock size={24} />}</div>
                              <div><p className="font-bold text-slate-800 dark:text-white">{conge.nom} {conge.prenoms}</p><p className="text-sm text-slate-500">{conge.matricule} • {conge.direction}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`px-2 py-0.5 rounded text-xs font-bold ${conge.jours_restants <= 1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{conge.jours_restants <= 1 ? 'FIN DEMAIN' : `Fin dans ${conge.jours_restants} jours`}</span></div></div>
                            </div>
                            <Button onClick={() => generateNoteReprise(conge)} className="bg-emerald-600 hover:bg-emerald-700"><FileText size={16} className="mr-2" /> Générer Note de Reprise</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Employees */}
          {activeView === 'employees' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion du Personnel</h2><p className="text-slate-500 text-sm">Répertoire des agents municipaux de Yopougon</p></div>
                <Button onClick={() => setShowAgentModal(true)} className="bg-emerald-600 hover:bg-emerald-700"><UserPlus size={18} className="mr-2" /> Nouvel Agent</Button>
              </div>
              <Card><CardContent className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10" placeholder="Rechercher par nom, matricule ou direction..." /></div></CardContent></Card>
              <Card>
                <CardContent className="p-0">
                  {loading ? <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Direction</th><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Contact</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Congés</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredAgents.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun agent trouvé</td></tr> : filteredAgents.map(agent => (
                            <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs">{agent.nom?.charAt(0)}{agent.prenoms?.charAt(0)}</div><div><p className="font-semibold text-slate-900 dark:text-white">{agent.nom} {agent.prenoms}</p><p className="text-xs text-slate-500">Mat: {agent.matricule}</p></div></div></td>
                              <td className="px-5 py-3"><p className="text-sm text-slate-700 dark:text-slate-300">{agent.direction}</p><p className="text-xs text-slate-400">{agent.fonction || '-'}</p></td>
                              <td className="px-5 py-3 text-sm text-slate-500"><p>{agent.telephone || '-'}</p><p className="text-xs">{agent.email || ''}</p></td>
                              <td className="px-5 py-3 text-center"><span className={`text-lg font-bold ${getSolde(agent) > 15 ? 'text-emerald-600' : getSolde(agent) > 0 ? 'text-amber-600' : 'text-red-600'}`}>{getSolde(agent)}j</span></td>
                              <td className="px-5 py-3 text-center"><Badge className={agent.statut?.toLowerCase() === 'actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>{agent.statut || 'Actif'}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leaves */}
          {activeView === 'leaves' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-slate-800 dark:text-white">Planning & Suivi des Congés</h2><p className="text-slate-500 text-sm">Gérez les absences et droits aux congés</p></div>
                <Button onClick={() => setShowCongeModal(true)} className="bg-emerald-600 hover:bg-emerald-700"><Calendar size={18} className="mr-2" /> Planifier un Congé</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card><CardContent className="p-5"><p className="text-xs text-slate-500 uppercase font-semibold">Congés Cumulés</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{agents.reduce((acc, a) => acc + getSolde(a), 0)} jours</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs text-slate-500 uppercase font-semibold">Demandes en Attente</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.demandesAttente}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs text-slate-500 uppercase font-semibold">Congés Approuvés</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.congesApprouves}</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Demandes de Congés</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {loading ? <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div> : conges.length === 0 ? <div className="flex flex-col items-center justify-center h-48 text-slate-400"><Calendar size={40} className="mb-2 opacity-50" /><p>Aucune demande de congé</p></div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Période</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Jours</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Type</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {conges.map(conge => (
                            <tr key={conge.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-5 py-3"><div><p className="font-semibold text-sm text-slate-800 dark:text-white">{conge.nom} {conge.prenoms}</p><p className="text-xs text-slate-500">{conge.matricule}</p></div></td>
                              <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300"><p>Du {new Date(conge.date_depart).toLocaleDateString('fr-FR')}</p><p>Au {new Date(conge.date_retour).toLocaleDateString('fr-FR')}</p></td>
                              <td className="px-5 py-3 text-center"><span className="text-lg font-bold text-slate-800 dark:text-white">{conge.nombre_jours}</span></td>
                              <td className="px-5 py-3 text-center text-sm text-slate-600 dark:text-slate-300">{conge.type}</td>
                              <td className="px-5 py-3 text-center">{getStatusBadge(conge.statut)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  {conge.statut?.toLowerCase().includes('attente') && (
                                    <>
                                      <button onClick={() => { setPasswordAction({ type: 'confirm', conge }); setShowPasswordModal(true); setConfirmPassword(''); }} className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors" title="Approuver"><CheckCircle size={18} /></button>
                                      <button onClick={() => { setPasswordAction({ type: 'cancel', conge }); setShowPasswordModal(true); setConfirmPassword(''); }} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Annuler"><XCircle size={18} /></button>
                                    </>
                                  )}
                                  {conge.statut?.toLowerCase().includes('approuve') && <button onClick={() => generateArreteDeService(conge)} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Générer Arrêté"><FileText size={18} /></button>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Choix Congés */}
          {activeView === 'choix-conges' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planification des Congés Annuels</h1><p className="text-slate-500 text-sm">Gérez les choix de congés des agents pour l'année {selectedYear}</p></div>
                <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm">
                  {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Users size={20} className="text-blue-600" /></div><div><p className="text-xs text-slate-500 uppercase">Total choix</p><p className="text-xl font-bold text-slate-800 dark:text-white">{choixConges.length}</p></div></div></div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><CheckCircle size={20} className="text-emerald-600" /></div><div><p className="text-xs text-slate-500 uppercase">Validés</p><p className="text-xl font-bold text-emerald-600">{choixConges.filter(c => c.statut === 'valide').length}</p></div></div></div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div><div><p className="text-xs text-slate-500 uppercase">En attente</p><p className="text-xl font-bold text-amber-600">{choixConges.filter(c => c.statut === 'en_attente').length}</p></div></div></div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div><div><p className="text-xs text-slate-500 uppercase">Sans choix</p><p className="text-xl font-bold text-red-600">{agents.filter(a => a.role === 'AGENT').length - choixConges.length}</p></div></div></div>
              </div>
              <Card>
                <CardHeader><CardTitle>Choix de congés {selectedYear}</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {choixConges.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Calendar size={40} className="mb-2 opacity-50" /><p>Aucun choix de congé pour {selectedYear}</p></div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th><th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Direction</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Date départ</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Durée</th><th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {choixConges.map((choix: any) => (
                            <tr key={choix.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-5 py-3"><div><p className="font-semibold text-slate-800 dark:text-white text-sm">{choix.nom} {choix.prenoms}</p><p className="text-xs text-slate-500">{choix.matricule}</p></div></td>
                              <td className="px-5 py-3"><p className="text-sm text-slate-600 dark:text-slate-300">{choix.direction}</p><p className="text-xs text-slate-400">{choix.fonction || '-'}</p></td>
                              <td className="px-5 py-3 text-center">{choix.dateDepartSouhaitee ? <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{new Date(choix.dateDepartSouhaitee).toLocaleDateString('fr-FR')}</p> : <span className="text-slate-400">-</span>}</td>
                              <td className="px-5 py-3 text-center"><span className="font-bold text-slate-700 dark:text-slate-300">{choix.nombreJours || 30} jours</span></td>
                              <td className="px-5 py-3 text-center"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${choix.statut === 'en_attente' ? 'bg-amber-100 text-amber-700' : choix.statut === 'valide' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{choix.statut === 'en_attente' ? 'En attente' : choix.statut === 'valide' ? 'Validé' : choix.statut}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documents */}
          {activeView === 'documents' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestion des Notes de Service</h2><p className="text-slate-500 mt-1">Édition et suivi des arrêts et reprises de service de la commune.</p></div>
              <Card>
                <CardHeader><CardTitle className="flex items-center justify-between">Documents d'Arrêt / Reprise<Badge className="bg-emerald-50 text-emerald-700">{conges.filter(c => c.statut?.toLowerCase().includes('approuve')).length} documents</Badge></CardTitle></CardHeader>
                <CardContent className="p-0">
                  {loading ? <div className="flex items-center justify-center h-48 text-slate-400">Chargement...</div> : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Période</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Employé</th><th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th><th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {conges.filter(c => c.statut?.toLowerCase().includes('approuve')).length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Aucun document disponible</td></tr> : conges.filter(c => c.statut?.toLowerCase().includes('approuve')).map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4"><div className="text-sm font-bold text-slate-900 dark:text-white">Du {new Date(doc.date_depart).toLocaleDateString('fr-FR')}</div><div className="text-xs text-slate-500">Au {new Date(doc.date_retour).toLocaleDateString('fr-FR')}</div></td>
                              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600">{doc.nom?.substring(0, 2)}</div><div><div className="text-sm font-semibold text-slate-900 dark:text-white">{doc.nom} {doc.prenoms}</div><div className="text-xs text-slate-500">{doc.direction}</div></div></div></td>
                              <td className="px-6 py-4"><div className="text-sm font-bold text-slate-700 dark:text-slate-300">{doc.type}</div></td>
                              <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => generateArreteDeService(doc)} className="text-orange-600 border-orange-200 hover:bg-orange-50"><FileText size={14} className="mr-1" /> Arrêt</Button><Button size="sm" variant="outline" onClick={() => generateNoteReprise(doc)} className="text-blue-600 border-blue-200 hover:bg-blue-50"><FileText size={14} className="mr-1" /> Reprise</Button></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Agent Modal */}
      <AgentForm isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} onSuccess={fetchData} />

      {/* Conge Modal */}
      {showCongeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardHeader><CardTitle>Nouvelle Demande de Congé</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Employé</Label><select value={congeForm.employe_id} onChange={e => setCongeForm({ ...congeForm, employe_id: e.target.value })} className="w-full border rounded-lg px-4 py-2"><option value="">Sélectionner un agent...</option>{agents.filter(a => a.role === 'AGENT').map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenoms} ({a.matricule})</option>)}</select></div>
              <div><Label>Date de départ</Label><Input type="date" value={congeForm.date_depart} onChange={e => setCongeForm({ ...congeForm, date_depart: e.target.value })} /></div>
              <div><Label>Type de congé</Label><select value={congeForm.type} onChange={e => setCongeForm({ ...congeForm, type: e.target.value })} className="w-full border rounded-lg px-4 py-2"><option value="Annuel">Congé Annuel</option><option value="Exceptionnel">Congé Exceptionnel</option><option value="Maladie">Congé Maladie</option><option value="Maternité">Congé Maternité</option></select></div>
              <div><Label>Durée</Label><div className="flex gap-3"><button onClick={() => setCongeForm({ ...congeForm, duree: '14' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${congeForm.duree === '14' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>14 jours</button><button onClick={() => setCongeForm({ ...congeForm, duree: '30' })} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${congeForm.duree === '30' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>30 jours</button></div></div>
              <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setShowCongeModal(false)}>Annuler</Button><Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddConge}>Confirmer</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader><CardTitle className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${passwordAction.type === 'confirm' ? 'bg-emerald-100' : 'bg-red-100'}`}><AlertTriangle size={20} className={passwordAction.type === 'confirm' ? 'text-emerald-600' : 'text-red-600'} /></div><div>{passwordAction.type === 'confirm' ? 'Confirmer le congé' : 'Annuler la demande'}</div></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{passwordAction.conge.nom} {passwordAction.conge.prenoms} - {passwordAction.conge.nombre_jours} jours</p>
              <p className="text-sm text-slate-600">Veuillez entrer votre mot de passe pour confirmer.</p>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Mot de passe" autoFocus />
              <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordAction(null); }}>Annuler</Button><Button className={passwordAction.type === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} onClick={handleCongeAction}>{passwordAction.type === 'confirm' ? 'Confirmer' : 'Annuler la demande'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Commune de Yopougon - Direction des Ressources Humaines</p>
          <p className="text-xs text-slate-400">Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
