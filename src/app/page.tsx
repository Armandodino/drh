'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
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
  Shield,
  PieChart as PieChartIcon,
  Loader2,
  ArrowUpRight,
  Download,
  Database,
  Activity,
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
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricule, password }),
    });
    return res.json();
  },

  changePassword: async (data: Record<string, unknown>) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
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

  updateCongeStatus: async (id: number, statut: string, password?: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/conges/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ statut, password }),
    });
    return res.json();
  },

  verifyPassword: async (password: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/auth/verify-password`, {
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

  getLogs: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  addLog: async (action: string, details: string) => {
    const token = localStorage.getItem('drh_token');
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action, details }),
    });
  },

  exportExcel: async (type: string) => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/export?type=${type}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'all' ? 'DRH_Yopougon_Export_Complet.xlsx' : `DRH_Yopougon_${type}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportBackup: async () => {
    const token = localStorage.getItem('drh_token');
    const res = await fetch(`${API_BASE}/backup`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRH_Yopougon_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
  <title>Fiche de Cessation de Service - ${conge.nom} ${conge.prenoms}</title>
  <style>
    @page { size: A4; margin: 1.5cm 2cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; max-width: 21cm; margin: 0 auto; padding: 30px 40px; }
    .page-border { border: 2px solid #000; padding: 30px 35px; min-height: 90vh; position: relative; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .header-left, .header-right { width: 45%; text-align: center; font-size: 10.5pt; line-height: 1.4; }
    .header-left p, .header-right p { margin-bottom: 2px; }
    .header-bold { font-weight: bold; font-size: 11pt; }
    .separator { border: none; border-top: 3px double #000; margin: 12px 0 20px; }
    .doc-title { text-align: center; margin: 20px 0 15px; }
    .doc-title h2 { font-size: 17pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; letter-spacing: 2px; margin-bottom: 5px; }
    .doc-number { font-size: 12pt; font-weight: bold; color: #333; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 8px 12px; border: 1px solid #999; font-size: 12pt; }
    .info-table .label { background: #f5f5f5; font-weight: bold; width: 35%; text-transform: uppercase; font-size: 10pt; letter-spacing: 0.5px; }
    .info-table .value { font-weight: bold; }
    .content-section { margin: 20px 0; text-align: justify; }
    .content-section p { margin-bottom: 10px; }
    .article { margin: 12px 0; padding-left: 15px; }
    .article-title { font-weight: bold; text-decoration: underline; }
    .highlight { font-weight: bold; text-decoration: underline; }
    .visa-section { margin-top: 30px; }
    .visa-row { display: flex; justify-content: space-between; margin-top: 40px; }
    .visa-box { width: 45%; text-align: center; }
    .visa-box .title { font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 5px; }
    .visa-box .date { font-size: 10pt; margin-bottom: 50px; }
    .visa-box .line { border-top: 1px dotted #000; margin-top: 60px; padding-top: 5px; font-style: italic; font-size: 9pt; }
    .footer-note { position: absolute; bottom: 15px; left: 35px; right: 35px; font-size: 8pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
    .flag-strip { display: flex; height: 4px; margin-bottom: 15px; }
    .flag-strip div { flex: 1; }
    .flag-orange { background: #f97316; }
    .flag-white { background: #e5e7eb; }
    .flag-green { background: #10b981; }
    @media print { body { padding: 0; } .page-border { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="page-border">
    <div class="flag-strip"><div class="flag-orange"></div><div class="flag-white"></div><div class="flag-green"></div></div>
    <div class="header-row">
      <div class="header-left">
        <p class="header-bold">DISTRICT D'ABIDJAN</p>
        <p>-----------</p>
        <p class="header-bold">COMMUNE DE YOPOUGON</p>
        <p>-----------</p>
        <p class="header-bold">DIRECTION DES RESSOURCES HUMAINES</p>
      </div>
      <div class="header-right">
        <p class="header-bold">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
        <p style="font-size:9pt; color:#666;">Union – Discipline – Travail</p>
        <p>-----------</p>
        <p style="font-size:10pt;">Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
      </div>
    </div>
    <hr class="separator" />
    <div class="doc-title">
      <h2>Fiche de Cessation de Service</h2>
      <p class="doc-number">N° ${numero}/DRH/MY/${annee}</p>
      <p style="font-size:10pt; color:#555; margin-top:5px;">(Départ en congé)</p>
    </div>
    <table class="info-table">
      <tr><td class="label">Nom & Prénoms</td><td class="value">${conge.nom} ${conge.prenoms}</td></tr>
      <tr><td class="label">Matricule</td><td class="value">${conge.matricule}</td></tr>
      <tr><td class="label">Fonction</td><td class="value">${conge.fonction || 'Agent Municipal'}</td></tr>
      <tr><td class="label">Direction / Service</td><td class="value">${conge.direction || 'Non spécifiée'}</td></tr>
      <tr><td class="label">Type de congé</td><td class="value">${conge.type || 'Annuel'}</td></tr>
      <tr><td class="label">Durée du congé</td><td class="value">${conge.nombre_jours} jours</td></tr>
      <tr><td class="label">Date de départ</td><td class="value">${formatDate(conge.date_depart)}</td></tr>
      <tr><td class="label">Date prévue de retour</td><td class="value">${formatDate(conge.date_retour)}</td></tr>
    </table>
    <div class="content-section">
      <p><span class="article-title">Objet :</span> Cessation temporaire de service pour départ en congé ${conge.type?.toLowerCase() || 'annuel'}.</p>
      <p class="article">Le (la) nommé(e) <span class="highlight">${conge.nom} ${conge.prenoms}</span>, matricule <span class="highlight">${conge.matricule}</span>, exerçant les fonctions de <span class="highlight">${conge.fonction || 'Agent Municipal'}</span> à la <span class="highlight">${conge.direction || 'Commune de Yopougon'}</span>, est autorisé(e) à cesser temporairement son service à compter du <span class="highlight">${formatDate(conge.date_depart)}</span>.</p>
      <p class="article">L'intéressé(e) devra impérativement reprendre ses fonctions le <span class="highlight">${formatDate(conge.date_retour)}</span>, à l'expiration de son congé.</p>
      <p class="article">En foi de quoi, la présente fiche de cessation de service lui est délivrée pour servir et valoir ce que de droit.</p>
    </div>
    <div class="visa-section">
      <div class="visa-row">
        <div class="visa-box">
          <p class="title">L'Intéressé(e)</p>
          <p class="date">Lu et approuvé</p>
          <p class="line">Signature</p>
        </div>
        <div class="visa-box">
          <p class="title">Le Directeur des Ressources Humaines</p>
          <p class="date">Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
          <p class="line">Cachet et Signature</p>
        </div>
      </div>
    </div>
    <div class="footer-note">
      Commune de Yopougon – Direction des Ressources Humaines – Réf: ${numero}/DRH/MY/${annee}
    </div>
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
  <title>Fiche de Reprise de Fonction - ${conge.nom} ${conge.prenoms}</title>
  <style>
    @page { size: A4; margin: 1.5cm 2cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; max-width: 21cm; margin: 0 auto; padding: 30px 40px; }
    .page-border { border: 2px solid #166534; padding: 30px 35px; min-height: 90vh; position: relative; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .header-left, .header-right { width: 45%; text-align: center; font-size: 10.5pt; line-height: 1.4; }
    .header-left p, .header-right p { margin-bottom: 2px; }
    .header-bold { font-weight: bold; font-size: 11pt; }
    .separator { border: none; border-top: 3px double #166534; margin: 12px 0 20px; }
    .doc-title { text-align: center; margin: 20px 0 15px; }
    .doc-title h2 { font-size: 17pt; font-weight: bold; text-transform: uppercase; text-decoration: underline; letter-spacing: 2px; margin-bottom: 5px; color: #166534; }
    .doc-number { font-size: 12pt; font-weight: bold; color: #333; }
    .success-banner { background: #dcfce7; border: 2px solid #166534; border-radius: 10px; padding: 15px; text-align: center; margin: 15px 0; }
    .success-banner p { font-size: 14pt; font-weight: bold; color: #166534; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 8px 12px; border: 1px solid #999; font-size: 12pt; }
    .info-table .label { background: #f0fdf4; font-weight: bold; width: 35%; text-transform: uppercase; font-size: 10pt; letter-spacing: 0.5px; }
    .info-table .value { font-weight: bold; }
    .content-section { margin: 20px 0; text-align: justify; }
    .content-section p { margin-bottom: 10px; }
    .article { margin: 12px 0; padding-left: 15px; }
    .article-title { font-weight: bold; text-decoration: underline; color: #166534; }
    .highlight { font-weight: bold; color: #166534; }
    .visa-section { margin-top: 30px; }
    .visa-row { display: flex; justify-content: space-between; margin-top: 40px; }
    .visa-box { width: 45%; text-align: center; }
    .visa-box .title { font-weight: bold; font-size: 11pt; text-transform: uppercase; margin-bottom: 5px; }
    .visa-box .date { font-size: 10pt; margin-bottom: 50px; }
    .visa-box .line { border-top: 1px dotted #000; margin-top: 60px; padding-top: 5px; font-style: italic; font-size: 9pt; }
    .footer-note { position: absolute; bottom: 15px; left: 35px; right: 35px; font-size: 8pt; color: #166534; text-align: center; border-top: 1px solid #bbf7d0; padding-top: 8px; }
    .flag-strip { display: flex; height: 4px; margin-bottom: 15px; }
    .flag-strip div { flex: 1; }
    .flag-orange { background: #f97316; }
    .flag-white { background: #e5e7eb; }
    .flag-green { background: #10b981; }
    @media print { body { padding: 0; } .page-border { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="page-border">
    <div class="flag-strip"><div class="flag-orange"></div><div class="flag-white"></div><div class="flag-green"></div></div>
    <div class="header-row">
      <div class="header-left">
        <p class="header-bold">DISTRICT D'ABIDJAN</p>
        <p>-----------</p>
        <p class="header-bold">COMMUNE DE YOPOUGON</p>
        <p>-----------</p>
        <p class="header-bold">DIRECTION DES RESSOURCES HUMAINES</p>
      </div>
      <div class="header-right">
        <p class="header-bold">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
        <p style="font-size:9pt; color:#666;">Union – Discipline – Travail</p>
        <p>-----------</p>
        <p style="font-size:10pt;">Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
      </div>
    </div>
    <hr class="separator" />
    <div class="doc-title">
      <h2>Fiche de Reprise de Fonction</h2>
      <p class="doc-number">N° ${numero}/DRH/MY/${annee}</p>
      <p style="font-size:10pt; color:#166534; margin-top:5px;">(Retour de congé)</p>
    </div>
    <div class="success-banner">
      <p>✓ CERTIFICAT DE REPRISE DE FONCTION</p>
    </div>
    <table class="info-table">
      <tr><td class="label">Nom & Prénoms</td><td class="value">${conge.nom} ${conge.prenoms}</td></tr>
      <tr><td class="label">Matricule</td><td class="value">${conge.matricule}</td></tr>
      <tr><td class="label">Fonction</td><td class="value">${conge.fonction || 'Agent Municipal'}</td></tr>
      <tr><td class="label">Direction / Service</td><td class="value">${conge.direction || 'Non spécifiée'}</td></tr>
      <tr><td class="label">Type de congé effectué</td><td class="value">${conge.type || 'Annuel'}</td></tr>
      <tr><td class="label">Période du congé</td><td class="value">Du ${formatDate(conge.date_depart)} au ${formatDate(conge.date_retour)} (${conge.nombre_jours} jours)</td></tr>
      <tr><td class="label">Date effective de reprise</td><td class="value" style="color:#166534;">${formatDate(conge.date_retour)}</td></tr>
    </table>
    <div class="content-section">
      <p><span class="article-title">Objet :</span> Reprise de fonction après congé ${conge.type?.toLowerCase() || 'annuel'}.</p>
      <p class="article">Je soussigné(e), <span class="highlight">Le Directeur des Ressources Humaines</span> de la Commune de Yopougon,</p>
      <p class="article"><span class="article-title">CERTIFIE</span> que le (la) nommé(e) <span class="highlight">${conge.nom} ${conge.prenoms}</span>, matricule <span class="highlight">${conge.matricule}</span>, exerçant les fonctions de <span class="highlight">${conge.fonction || 'Agent Municipal'}</span> à la <span class="highlight">${conge.direction || 'Commune de Yopougon'}</span>,</p>
      <p class="article">Ayant bénéficié d'un congé ${conge.type?.toLowerCase() || 'annuel'} du <span class="highlight">${formatDate(conge.date_depart)}</span> au <span class="highlight">${formatDate(conge.date_retour)}</span>, soit une durée de <span class="highlight">${conge.nombre_jours} jours</span>,</p>
      <p class="article"><span class="article-title">A EFFECTIVEMENT REPRIS SES FONCTIONS</span> ce jour, conformément aux dispositions réglementaires en vigueur.</p>
      <p class="article">En foi de quoi, la présente fiche de reprise de fonction lui est délivrée pour servir et valoir ce que de droit.</p>
    </div>
    <div class="visa-section">
      <div class="visa-row">
        <div class="visa-box">
          <p class="title">L'Intéressé(e)</p>
          <p class="date">Lu et approuvé</p>
          <p class="line">Signature</p>
        </div>
        <div class="visa-box">
          <p class="title">Le Directeur des Ressources Humaines</p>
          <p class="date">Yopougon, le ${formatDate(now.toISOString().split('T')[0])}</p>
          <p class="line">Cachet et Signature</p>
        </div>
      </div>
    </div>
    <div class="footer-note">
      Commune de Yopougon – Direction des Ressources Humaines – Réf: ${numero}/DRH/MY/${annee}
    </div>
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
  const [statusText, setStatusText] = useState('Connexion sécurisée...');

  useEffect(() => {
    const steps = [
      { text: 'Connexion sécurisée...', prog: 20, delay: 200 },
      { text: 'Chargement des données RH...', prog: 50, delay: 800 },
      { text: 'Préparation du tableau de bord...', prog: 80, delay: 1600 },
      { text: 'Bienvenue !', prog: 100, delay: 2200 },
    ];
    steps.forEach(({ text, prog, delay }) => {
      setTimeout(() => { setStatusText(text); setProgress(prog); }, delay);
    });
    setTimeout(() => onComplete(), 2900);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
    >
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated orbs */}
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.2, 0.08] }} 
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[150px]" 
      />
      <motion.div 
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.06, 0.15, 0.06] }} 
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[130px]" 
      />

      {/* Center card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative mb-10"
        >
          {/* Outer ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute -inset-4 rounded-full border-2 border-orange-400/30"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            className="absolute -inset-8 rounded-full border border-emerald-400/20"
          />
          <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl shadow-orange-500/10">
            <motion.img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain drop-shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mairie de <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">Yopougon</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500/50" />
            <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">
              Portail RH Sécurisé
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs"
        >
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="h-full w-full rounded-full bg-gradient-to-r from-orange-500 via-white/50 to-emerald-500" />
            </motion.div>
          </div>
          
          {/* Status text and percentage */}
          <div className="flex items-center justify-between">
            <motion.p 
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-semibold text-white/50"
            >
              {statusText}
            </motion.p>
            <span className="text-xs font-black text-white/30 tabular-nums">{progress}%</span>
          </div>
        </motion.div>

        {/* Bottom flag strip */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1 }}
          className="absolute bottom-10 flex items-center gap-3"
        >
          <div className="flex h-1 w-8 rounded-full overflow-hidden">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-emerald-500" />
          </div>
          <span className="text-[9px] font-bold text-white/20 tracking-[0.15em] uppercase">
            République de Côte d&apos;Ivoire
          </span>
          <div className="flex h-1 w-8 rounded-full overflow-hidden">
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-orange-500" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};


// ============================================
// AGENT FORM COMPONENT
// ============================================
const AgentForm = ({ isOpen, onClose, onSuccess, currentUserRole }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; currentUserRole?: string }) => {
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
    jours_pris_historique: 0,
    role: 'AGENT'
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
          <div className="bg-gradient-to-r from-orange-500 via-white to-emerald-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Nouvel Agent Municipal</h3>
            <p className="text-emerald-100 text-sm mt-1">Étape {step} sur 2</p>
          </div>
          <div className="h-1 bg-slate-200"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${(step / 2) * 100}%` }} /></div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5"><User size={12} /> Matricule *</Label>
                    <Input value={formData.matricule} onChange={e => setFormData({ ...formData, matricule: e.target.value.toLowerCase() })} placeholder="Ex: ag001" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Genre</Label>
                    <select value={formData.sexe} onChange={e => setFormData({ ...formData, sexe: e.target.value })} className="w-full border rounded-lg px-4 py-2 bg-white dark:bg-slate-950">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  {currentUserRole === 'SUPER_ADMIN' && (
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Rôle</Label>
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full border rounded-lg px-4 py-2 bg-emerald-50 text-emerald-800 font-bold border-emerald-200">
                      <option value="AGENT">Agent Régulier</option>
                      <option value="ADMIN">Gérante (ADMIN)</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  )}
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
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setStep(2)} disabled={!formData.matricule || !formData.nom || !formData.prenoms || !formData.date_embauche}>Suivant →</Button>
            ) : (
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSubmit} disabled={loading}>{loading ? 'Enregistrement...' : '✓ Créer l\'Agent'}</Button>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Modals
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showCongeModal, setShowCongeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [passwordAction, setPasswordAction] = useState<any>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editingAgent, setEditingAgent] = useState<Employe | null>(null);
  const [showEditAgentModal, setShowEditAgentModal] = useState(false);
  const [editAgentForm, setEditAgentForm] = useState({
    nom: '', prenoms: '', sexe: 'M', direction: '', fonction: '', telephone: '', email: '', dateEmbauche: ''
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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
    setIsSubmitting(true);
    try {
      const data = await api.login(matricule, password);
      await new Promise(r => setTimeout(r, 600)); // Smooth loading visual
      if (data.token) {
        localStorage.setItem('drh_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        if (data.mustChangePassword) {
           setMustChangePassword(true);
           setShowSplash(false);
        } else {
           setShowSplash(true);
           toast.success(`Bienvenue, ${data.user.nom}`);
        }
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch {
      setLoginError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Force Password Change Handler
  const handleForcePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      const res = await api.changePassword({ newPassword, currentPassword: password });
      if (res.success) {
        toast.success('Mot de passe mis à jour avec succès! Bienvenue.');
        setMustChangePassword(false);
        setNewPassword('');
        setShowSplash(true);
      } else {
        toast.error(res.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (e) {
      toast.error('Erreur de connexion au serveur');
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
        const response = await api.updateCongeStatus(passwordAction.conge.id, 'Approuvé', confirmPassword);
        if (response.message) {
          toast.error(response.message);
          return;
        }
        toast.success('Congé approuvé');
        generateArreteDeService(passwordAction.conge);
      } else if (passwordAction.type === 'reject') {
        const response = await api.updateCongeStatus(passwordAction.conge.id, 'Annulé', confirmPassword);
        if (response.message) {
          toast.error(response.message);
          return;
        }
        toast.success('Congé annulé');
      } else if (passwordAction.type === 'deleteAgent') {
        const response = await api.deleteAgent(passwordAction.agentId, confirmPassword);
        if (response.message && response.message !== 'Agent supprimé avec succès') {
          toast.error(response.message);
          return;
        }
        toast.success('Agent supprimé');
      } else if (passwordAction.type === 'editAgent') {
        const response = await api.updateAgent(passwordAction.agentId, passwordAction.editData);
        if (response.message && response.message !== 'Agent mis à jour avec succès') {
          toast.error(response.message);
          return;
        }
        toast.success('Agent mis à jour avec succès');
        setEditingAgent(null);
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

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8">
        {/* Background Layer with reduced blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/login-bg.png)' }}
        />
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-none" />

        {/* Animated ambient light behind the card blending Ivory Coast Colors */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"
        />

        {/* Centered Glassmorphic Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[340px]"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <img src="/logo.png" alt="Logo Yopougon" className="w-28 h-auto drop-shadow-xl" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white tracking-tight drop-shadow-lg uppercase"
            >
              Mairie de <span className="text-orange-400">Yopougon</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-white to-emerald-300 font-bold mt-2 drop-shadow-sm text-lg"
            >
              Direction des Ressources Humaines
            </motion.p>
          </div>

          <Card className="border border-white/20 shadow-[0_8px_32px_rgba(247,127,0,0.15)] overflow-hidden bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl">
            <CardHeader className="space-y-1 pb-6 pt-8 px-8 sm:px-10 border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
              <CardTitle className="text-2xl font-bold text-white tracking-wide text-center">
                Espace Sécurisé
              </CardTitle>
              <CardDescription className="text-orange-50/80 font-medium text-center">
                Veuillez vous identifier pour continuer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 sm:px-10">
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Matricule */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Label htmlFor="matricule" className="flex items-center gap-2 text-white font-semibold text-sm">
                    <User size={16} className="text-orange-400" />
                    Numéro Matricule
                  </Label>
                  <Input
                    id="matricule"
                    value={matricule}
                    onChange={e => setMatricule(e.target.value)}
                    placeholder="Ex: drh001"
                    className="h-12 bg-white/5 border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder:text-white/30 rounded-xl px-4 shadow-inner"
                    required
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <Label htmlFor="password" className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Settings size={16} className="text-emerald-400" />
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 pr-12 bg-white/5 border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-white placeholder:text-white/30 rounded-xl px-4 shadow-inner"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={16} className="text-red-300" />
                        </div>
                        <p className="text-red-100 text-sm font-medium">{loginError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-500 border-0 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-400/50 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Connexion en cours...
                        </>
                      ) : (
                        'Connexion au portail'
                      )}
                    </span>
                    {!isSubmitting && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            
            <div className="px-8 pb-6 pt-4 border-t border-white/10 bg-black/10">
              <p className="text-center text-white/50 text-xs font-semibold flex items-center justify-center gap-2">
                <Shield size={14} className="text-emerald-400/70" />
                Accès exclusivement réservé au personnel
              </p>
            </div>
          </Card>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/50 text-xs font-medium mt-6 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-8 h-1 flex rounded-full overflow-hidden opacity-50">
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-emerald-500" />
            </div>
            <span>© {new Date().getFullYear()} Mairie de Yopougon. Tous droits réservés.</span>
            <span className="text-[10px] text-white/30">République de Côte d'Ivoire — Union · Discipline · Travail</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // FORCE PASSWORD CHANGE
  if (mustChangePassword) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/login-bg.png)' }} />
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-none" />
        <Card className="relative z-10 w-full max-w-[400px] bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center text-white">
          <Shield size={48} className="mx-auto text-orange-400 mb-4" />
          <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">Sécurité Requise</h2>
          <p className="text-white/70 text-sm mb-6">Pour protéger le compte de Gérance, veuillez choisir un nouveau mot de passe sécurisé (min. 6 caractères).</p>
          <div className="space-y-4 mb-6">
            <Input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Nouveau mot de passe" 
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 py-6 text-center text-lg focus:border-orange-500 transition-colors"
            />
          </div>
          <Button 
            onClick={handleForcePasswordChange} 
            className="w-full bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white shadow-lg py-6 rounded-xl font-bold text-lg border border-white/10"
          >
            Sécuriser mon compte
          </Button>
          <Button 
            onClick={() => { setMustChangePassword(false); }} 
            variant="outline"
            className="w-full mt-3 border-white/20 text-white/70 hover:text-white hover:bg-white/10 py-5 rounded-xl font-bold"
          >
            Annuler
          </Button>
        </Card>
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
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 sticky top-0 z-40 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                Mairie de Yopougon
              </h1>
              <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
                Direction des Ressources Humaines
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <button onClick={() => setActiveView('notifications')} className="relative w-11 h-11 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 group">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-orange-600 transition-colors" />
              {notifCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm shadow-red-500/30">
                  {notifCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveView('settings')} className="w-11 h-11 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 group">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-orange-600 transition-colors" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser?.nom}
                </p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {currentUser?.role === 'ADMIN_DRH' ? 'Superviseur' : 'Développeur'}
                </p>
              </div>
              
              <div className="relative group cursor-pointer" onClick={handleLogout}>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center font-black text-lg shadow-sm border border-slate-300 dark:border-slate-600 transition-transform group-hover:scale-105">
                  {currentUser?.prenoms?.charAt(0) || currentUser?.nom?.charAt(0) || 'A'}
                </div>
                {/* Logout Tooltip/Overlay */}
                <div className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-red-500/30 backdrop-blur-md z-10 scale-95 group-hover:scale-100">
                  <LogOut size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 p-4 flex-col gap-2 overflow-y-auto hidden lg:flex relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          
          <div className="mb-4 px-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu Principal</p>
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', icon: Home, label: 'Tableau de bord' },
                { id: 'notifications', icon: Bell, label: 'Notifications', badge: congesFinProche.length },
                { id: 'employees', icon: Users, label: 'Employés' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group ${
                    activeView === item.id 
                    ? 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-500/10 dark:to-transparent text-orange-700 dark:text-orange-400 font-bold shadow-sm border border-orange-200/50 dark:border-orange-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {activeView === item.id && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-500" />
                  )}
                  <item.icon size={20} className={`transition-colors ${activeView === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gestion des Congés</p>
            <nav className="space-y-1.5">
              {[
                { id: 'leaves', icon: Calendar, label: 'Congés & Absences' },
                { id: 'choix-conges', icon: Calendar, label: 'Planification Annuelle' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group ${
                    activeView === item.id 
                    ? 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-500/10 dark:to-transparent text-orange-700 dark:text-orange-400 font-bold shadow-sm border border-orange-200/50 dark:border-orange-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                  }`}
                >
                  {activeView === item.id && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-500" />
                  )}
                  <item.icon size={20} className={`transition-colors ${activeView === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3 mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rapports</p>
            <button
              onClick={() => setActiveView('documents')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group ${
                activeView === 'documents' 
                ? 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-500/10 dark:to-transparent text-orange-700 dark:text-orange-400 font-bold shadow-sm border border-orange-200/50 dark:border-orange-500/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {activeView === 'documents' && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-500" />
              )}
              <FileText size={20} className={`transition-colors ${activeView === 'documents' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              Documents
            </button>
          </div>
          
          <div className="mt-auto mx-3 p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/50 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <Shield size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Session Sécurisée</p>
                <p className="text-[10px] text-slate-500">Chiffrement AES-256</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          {/* Dashboard */}
          {activeView === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              {/* HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl h-[200px]">
                {/* Background image with overlay */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/bg.png)' }} />
                <div className="absolute inset-0 bg-slate-900/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                {/* Ivory Coast flag strip on top */}
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-orange-500" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-emerald-500" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-center px-8 gap-6">
                  {/* Logo */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl flex-shrink-0"
                  >
                    <img src="/logo.png" alt="Logo Yopougon" className="w-14 h-14 object-contain drop-shadow-xl" />
                  </motion.div>

                  {/* Title block */}
                  <div className="flex-1">
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-orange-300/90 text-xs font-bold uppercase tracking-[0.2em] mb-1"
                    >
                      District d&apos;Abidjan — Commune de Yopougon
                    </motion.p>
                    <motion.h2
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-black text-white tracking-tight leading-tight mb-1.5"
                    >
                      Tableau de Bord RH
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/50 font-medium text-sm"
                    >
                      Direction des Ressources Humaines · Vue d&apos;ensemble globale
                    </motion.p>
                  </div>

                  {/* Date badge */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="hidden lg:flex flex-col items-end gap-1"
                  >
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-white px-4 py-2.5 rounded-2xl">
                      <Calendar size={16} className="text-orange-400" />
                      <span className="font-bold text-sm whitespace-nowrap">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Agents */}
                {[
                  {
                    label: 'Total Agents', value: stats.totalAgents, unit: '',
                    icon: Users, color: 'from-orange-500 to-amber-500',
                    bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200/50 dark:border-orange-500/20',
                    textColor: 'text-orange-600 dark:text-orange-400', badge: 'Personnel actif', badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
                    delay: 0.05,
                  },
                  {
                    label: 'Congés Approuvés', value: stats.congesApprouves, unit: '',
                    icon: CheckCircle, color: 'from-emerald-500 to-teal-500',
                    bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/20',
                    textColor: 'text-emerald-600 dark:text-emerald-400', badge: 'Validés', badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                    delay: 0.1,
                  },
                  {
                    label: 'En Attente', value: stats.demandesAttente, unit: '',
                    icon: Clock, color: 'from-amber-500 to-orange-400',
                    bg: stats.demandesAttente > 0 ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-slate-50 dark:bg-slate-800/60',
                    border: stats.demandesAttente > 0 ? 'border-amber-200/50 dark:border-amber-500/20' : 'border-slate-200/50 dark:border-slate-700/50',
                    textColor: stats.demandesAttente > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400',
                    badge: 'À valider', badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                    delay: 0.15,
                  },
                  {
                    label: 'Solde Global', value: agents.reduce((acc, a) => acc + getSolde(a), 0), unit: ' j',
                    icon: TrendingUp, color: 'from-blue-500 to-indigo-500',
                    bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200/50 dark:border-blue-500/20',
                    textColor: 'text-blue-600 dark:text-blue-400', badge: 'Jours restants', badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
                    delay: 0.2,
                  },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay }}
                    className="group"
                  >
                    <Card className={`relative overflow-hidden border ${card.border} ${card.bg} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      {/* Top accent gradient bar */}
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.color}`} />
                      {/* Floating glow behind icon */}
                      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg flex items-center justify-center`}>
                            <card.icon size={20} className="text-white" />
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.badgeBg}`}>{card.badge}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
                        <p className={`text-4xl font-black ${card.textColor}`}>
                          {card.value}
                          {card.unit && <span className="text-base font-semibold text-slate-400 ml-1">{card.unit}</span>}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* LEAVE ANNOUNCEMENTS */}
              {congesFinProche.length > 0 && (
                <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                  <CardHeader className="bg-amber-50/80 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800/30 backdrop-blur-md">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 flex items-center justify-center shadow-inner border border-amber-200/50 dark:border-amber-700/50">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      Alertes Congés
                      <span className="ml-auto bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">{congesFinProche.length}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {congesFinProche.slice(0, 5).map((c: { id: number; nom: string; prenoms: string; direction: string; date_retour: string; nombre_jours: number }, i: number) => {
                        const retour = new Date(c.date_retour);
                        const now = new Date();
                        const diffDays = Math.ceil((retour.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const isEnding = diffDays <= 3 && diffDays >= 0;
                        const isUpcoming = diffDays > 3;
                        return (
                          <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm ${
                              isEnding ? 'bg-gradient-to-br from-red-500 to-rose-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'
                            }`}>
                              {c.nom?.charAt(0)}{c.prenoms?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{c.nom} {c.prenoms}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{c.direction}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`text-xs font-bold border-0 ${
                                isEnding ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : isUpcoming ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isEnding ? `Fin dans ${diffDays}j` : `Retour dans ${diffDays}j`}
                              </Badge>
                              <p className="text-[10px] text-slate-400 mt-1">{retour.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Pie Chart */}
                <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                  <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center shadow-inner border border-emerald-200/50 dark:border-emerald-700/50">
                        <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Répartition par Statut
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    {(() => {
                      const statusData = [
                        { name: 'Approuvé', value: conges.filter(c => c.statut?.toLowerCase().includes('approuve') || c.statut?.toLowerCase().includes('valid')).length, color: '#10b981' }, // Emerald
                        { name: 'En Attente', value: conges.filter(c => c.statut?.toLowerCase().includes('attente')).length, color: '#f97316' }, // Orange
                        { name: 'Refusé', value: conges.filter(c => c.statut?.toLowerCase().includes('refus')).length, color: '#ef4444' }, // Red
                        { name: 'Annulé', value: conges.filter(c => c.statut?.toLowerCase().includes('annul')).length, color: '#94a3b8' }, // Slate
                      ].filter(d => d.value > 0);
                      
                      if (statusData.length === 0) {
                        return <div className="flex flex-col items-center justify-center h-[260px]"><PieChartIcon size={48} className="text-slate-200 dark:text-slate-800 mb-3" /><p className="text-slate-400 font-medium text-sm">Données insuffisantes</p></div>;
                      }
                      
                      return (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={105}
                              paddingAngle={6}
                              dataKey="value"
                              stroke="none"
                              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 8px 12px ${entry.color}40)` }} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }} 
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Type Pie Chart */}
                <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors" />
                  <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 flex items-center justify-center shadow-inner border border-orange-200/50 dark:border-orange-700/50">
                        <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Demandes par Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 relative z-10">
                    {(() => {
                      // Ivory Coast theme inspired colors
                      const typeColors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
                      const typeData = [
                        { name: 'Annuel', value: conges.filter(c => c.type === 'Annuel').length },
                        { name: 'Maladie', value: conges.filter(c => c.type === 'Maladie').length },
                        { name: 'Maternité', value: conges.filter(c => c.type === 'Maternité').length },
                        { name: 'Paternité', value: conges.filter(c => c.type === 'Paternité').length },
                        { name: 'Exceptionnel', value: conges.filter(c => c.type === 'Exceptionnel').length },
                        { name: 'Sans solde', value: conges.filter(c => c.type === 'Sans solde').length },
                      ].filter(d => d.value > 0);
                      
                      if (typeData.length === 0) {
                        return <div className="flex flex-col items-center justify-center h-[260px]"><Briefcase size={48} className="text-slate-200 dark:text-slate-800 mb-3" /><p className="text-slate-400 font-medium text-sm">Données insuffisantes</p></div>;
                      }
                      
                      return (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={typeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={105}
                              paddingAngle={6}
                              dataKey="value"
                              stroke="none"
                              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                              {typeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={typeColors[index % typeColors.length]} style={{ filter: `drop-shadow(0px 8px 12px ${typeColors[index % typeColors.length]}40)` }} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }} 
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              
              {/* Area Chart - Monthly Evolution */}
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center shadow-inner border border-blue-200/50 dark:border-blue-700/50">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Évolution Mensuelle
                      </CardTitle>
                      <CardDescription className="text-slate-500 ml-13 font-medium">Volumétrie des demandes et jours accordés ({new Date().getFullYear()})</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
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
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorJours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" dark-stroke="#334155" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                            dy={10} 
                            style={{ textTransform: 'capitalize' }}
                          />
                          <YAxis 
                            yAxisId="left" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }} 
                            dx={-10}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }} 
                            dx={10}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                          />
                          <Legend 
                            iconType="circle" 
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="demandes"
                            name="Nombre de demandes"
                            stroke="#f97316"
                            strokeWidth={3}
                            fill="url(#colorDemandes)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316', style: { filter: 'drop-shadow(0px 4px 6px rgba(249,115,22,0.5))' } }}
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="jours"
                            name="Total jours accordés"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#colorJours)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0px 4px 6px rgba(16,185,129,0.5))' } }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </CardContent>
              </Card>
              
              {/* Recent Requests Table */}
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center shadow-inner border border-emerald-200/50 dark:border-emerald-700/50">
                        <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Demandes Récentes
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="group/btn h-9 px-4 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40 rounded-xl shadow-sm transition-all" 
                      onClick={() => setActiveView('leaves')}
                    >
                      Voir tout
                      <ArrowUpRight className="ml-1.5 w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                      <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin mb-4" />
                      <p className="font-bold tracking-widest uppercase text-xs animate-pulse text-slate-500">Chargement des demandes...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Employé</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Type & Période</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Durée</th>
                            <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                          {conges.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                                <History size={40} className="mx-auto mb-4 opacity-20" />
                                <span className="font-bold text-base text-slate-500">Aucun congé récent enregistré.</span>
                              </td>
                            </tr>
                          ) : conges.slice(-5).reverse().map((conge, i) => (
                            <tr key={conge.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${i % 2 === 0 ? 'from-orange-500 to-amber-500' : 'from-emerald-500 to-teal-500'} text-white flex items-center justify-center font-black text-base shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                                    {conge.nom?.charAt(0)}{conge.prenoms?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-amber-400 transition-colors">{conge.nom} {conge.prenoms}</p>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{conge.direction || 'Direction non spécifiée'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shadow-inner" />
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{conge.type || 'Annuel'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-4 bg-slate-100 dark:bg-slate-800/50 w-fit px-2 py-0.5 rounded-md">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span>{new Date(conge.date_depart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} <span className="text-slate-300 dark:text-slate-600 mx-1">→</span> {new Date(conge.date_retour).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                                  <span className="font-black text-lg text-slate-800 dark:text-slate-200">{conge.nombre_jours}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-[-2px]">jr{conge.nombre_jours > 1 && 's'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right align-middle">
                                {getStatusBadge(conge.statut)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications */}
          {activeView === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Centre de Notifications</h2>
                  <p className="text-slate-500 font-medium mt-1">Gérez les alertes et les retours de congés imminents</p>
                </div>
              </div>
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-md px-6 py-5 relative z-10 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/20 flex items-center justify-center shadow-inner border border-red-200/50 dark:border-red-700/50">
                      <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    Alertes de Reprise ({congesFinProche.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  {congesFinProche.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                      <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-slate-800">
                        <CheckCircle size={40} className="text-emerald-500" />
                      </div>
                      <p className="font-black text-slate-500 text-lg">Aucun agent attendu prochainement</p>
                      <p className="text-sm font-medium mt-1">Tous les retours sont à jour.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100/80 dark:divide-slate-800/60 w-full">
                      {congesFinProche.map((conge: any, index: number) => (
                        <div key={conge.id} className={`p-6 transition-colors group relative overflow-hidden ${conge.jours_restants <= 1 ? 'bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20' : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40'}`}>
                          {conge.jours_restants <= 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4 md:pl-0">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border ${conge.jours_restants <= 1 ? 'bg-gradient-to-br from-red-100 to-red-50 border-red-200/50 text-red-600 dark:from-red-900/40 dark:to-red-800/20 dark:border-red-700/50 dark:text-red-400' : 'bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200/50 text-amber-600 dark:from-amber-900/40 dark:to-amber-800/20 dark:border-amber-700/50 dark:text-amber-400'}`}>
                                {conge.jours_restants <= 1 ? <AlertTriangle className="animate-pulse" size={28} /> : <Clock size={28} />}
                              </div>
                              <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{conge.nom} {conge.prenoms}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">MAT: {conge.matricule}</span>
                                  <span className="text-sm font-semibold text-slate-500">{conge.direction}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm ${conge.jours_restants <= 1 ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                    {conge.jours_restants <= 1 ? 'FIN DEMAIN' : `Fin dans ${conge.jours_restants} jours`}
                                  </span>
                                  <span className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                                    Début: {new Date(conge.date_depart).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => generateNoteReprise(conge)} 
                              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:-translate-y-0.5 rounded-xl h-12 px-6 font-bold w-full md:w-auto flex-shrink-0"
                            >
                              <FileText size={18} className="mr-2" /> 
                              Note de Reprise
                              <ArrowUpRight size={16} className="ml-2 opacity-50" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Employees */}
          {activeView === 'employees' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Gestion du Personnel</h2>
                  <p className="text-slate-500 font-medium mt-1">Répertoire officiel des agents municipaux de Yopougon</p>
                </div>
                <Button onClick={() => setShowAgentModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 rounded-xl h-11 px-6 font-bold">
                  <UserPlus size={18} className="mr-2" /> 
                  Nouvel Agent
                </Button>
              </div>

              {/* Search Bar */}
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <CardContent className="p-5 relative z-10 w-full flex items-center gap-4">
                  <div className="relative group/search flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-orange-500 transition-colors" size={20} />
                    <Input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      className="pl-12 h-14 bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 rounded-2xl text-base shadow-inner transition-all hover:bg-white dark:hover:bg-slate-900" 
                      placeholder="Rechercher par nom, matricule ou direction..." 
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Users size={16} className="text-emerald-500" />
                    <span>{filteredAgents.length} Agent{filteredAgents.length > 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Employees Table */}
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-[spin_1s_ease-in-out_infinite] mb-6 shadow-lg shadow-emerald-500/20" />
                      <p className="font-bold tracking-widest text-xs uppercase animate-pulse text-slate-500">Chargement du répertoire...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Direction & Fonction</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Soldes Congés</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                          {filteredAgents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                <Search size={48} className="mx-auto mb-4 opacity-10 text-slate-500" />
                                <span className="font-bold text-base text-slate-500">Aucun agent trouvé correspondant à votre recherche.</span>
                              </td>
                            </tr>
                          ) : filteredAgents.map((agent, i) => (
                            <tr key={agent.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${i % 2 === 0 ? 'from-emerald-500 to-teal-500' : 'from-orange-500 to-amber-500'} text-white flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                                    {agent.nom?.charAt(0)}{agent.prenoms?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors">{agent.nom} {agent.prenoms}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 tracking-wider">MAT: {agent.matricule}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{agent.direction}</p>
                                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Briefcase size={12} className="text-emerald-500 border border-emerald-500/20 rounded-sm" /> {agent.fonction || 'Non renseigné'}</p>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Phone size={12} className="text-slate-400" />
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{agent.telephone || 'Non renseigné'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail size={12} className="text-slate-400" />
                                  <p className="text-[11px] text-slate-400 font-medium">{agent.email || '-'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                <div className={`inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border ${getSolde(agent) >= 15 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-700/60' : getSolde(agent) > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-700/60' : 'bg-red-50 dark:bg-red-900/20 border-red-200/60 dark:border-red-700/60'} shadow-sm`}>
                                  <span className={`font-black text-lg leading-none ${getSolde(agent) >= 15 ? 'text-emerald-700 dark:text-emerald-400' : getSolde(agent) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>{getSolde(agent)}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-widest mt-[2px] ${getSolde(agent) >= 15 ? 'text-emerald-500' : getSolde(agent) > 0 ? 'text-amber-500' : 'text-red-500'}`}>jrs</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                <Badge className={`font-black tracking-widest text-[10px] uppercase py-1.5 px-4 rounded-xl border-0 ${agent.statut?.toLowerCase() === 'actif' ? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                  {agent.statut || 'Actif'}
                                </Badge>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingAgent(agent);
                                      setEditAgentForm({
                                        nom: agent.nom || '',
                                        prenoms: agent.prenoms || '',
                                        sexe: agent.sexe || 'M',
                                        direction: agent.direction || '',
                                        fonction: agent.fonction || '',
                                        telephone: agent.telephone || '',
                                        email: agent.email || '',
                                        dateEmbauche: agent.dateEmbauche ? new Date(agent.dateEmbauche).toISOString().split('T')[0] : ''
                                      });
                                      setShowEditAgentModal(true);
                                    }}
                                    className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-all hover:scale-110 border border-blue-200/50 dark:border-blue-700/50"
                                    title="Modifier"
                                  >
                                    <Settings size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setPasswordAction({ type: 'deleteAgent', agentId: agent.id, agentName: `${agent.nom} ${agent.prenoms}` });
                                      setConfirmPassword('');
                                      setShowPasswordModal(true);
                                    }}
                                    className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 transition-all hover:scale-110 border border-red-200/50 dark:border-red-700/50"
                                    title="Supprimer"
                                  >
                                    <AlertTriangle size={16} />
                                  </button>
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
            </motion.div>
          )}

          {/* Leaves */}
          {activeView === 'leaves' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Suivi des Congés</h2>
                  <p className="text-slate-500 font-medium mt-1">Gérez les absences et les demandes de congés</p>
                </div>
                <Button onClick={() => setShowCongeModal(true)} className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 rounded-xl h-11 px-6 font-bold">
                  <Calendar size={18} className="mr-2" /> 
                  Saisir un Congé
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                          Congés Cumulés
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                          {agents.reduce((acc, a) => acc + getSolde(a), 0)}
                          <span className="text-xl text-slate-400 ml-1">jrs</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <Calendar size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                          Demandes en Attente
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                          {stats.demandesAttente}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                        <Clock size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                          Congés Approuvés
                        </p>
                        <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
                          {stats.congesApprouves}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Leaves Table */}
              <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-md px-6 py-5 relative z-10 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center shadow-inner border border-blue-200/50 dark:border-blue-700/50">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Registre des Demandes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-[spin_1s_ease-in-out_infinite] mb-6 shadow-lg shadow-emerald-500/20" />
                      <p className="font-bold tracking-widest text-xs uppercase animate-pulse text-slate-500">Chargement des registres...</p>
                    </div>
                  ) : conges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                      <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-slate-800">
                        <Calendar size={40} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="font-black text-slate-500 text-lg">Aucune demande enregistrée</p>
                      <p className="text-sm font-medium mt-1">Les nouvelles demandes apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Période</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Jours</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                            <th className="px-6 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/60 bg-white dark:bg-slate-900/30">
                          {conges.map((conge, i) => (
                            <tr key={conge.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${i % 2 === 0 ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'} text-white flex items-center justify-center font-black text-lg shadow-lg shadow-slate-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                                    {conge.nom?.charAt(0)}{conge.prenoms?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors">{conge.nom} {conge.prenoms}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 tracking-wider">MAT: {conge.matricule}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                  <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 w-fit px-2 py-1 rounded-md"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> {new Date(conge.date_depart).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                                  <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 w-fit px-2 py-1 rounded-md"><div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" /> {new Date(conge.date_retour).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                <div className="inline-flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                                  <span className="font-black text-lg text-slate-800 dark:text-white leading-none">{conge.nombre_jours}</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-[2px]">jrs</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                <span className="text-xs font-black tracking-widest uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                  {conge.type}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center align-middle">
                                {getStatusBadge(conge.statut)}
                              </td>
                              <td className="px-6 py-5 align-middle">
                                <div className="flex items-center justify-center gap-2">
                                  {conge.statut?.toLowerCase().includes('attente') && (
                                    <>
                                      <button onClick={() => { setPasswordAction({ type: 'confirm', conge }); setShowPasswordModal(true); setConfirmPassword(''); }} className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 transition-all shadow-sm hover:shadow-emerald-500/20 group/btn" title="Approuver"><CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" /></button>
                                      <button onClick={() => { setPasswordAction({ type: 'cancel', conge }); setShowPasswordModal(true); setConfirmPassword(''); }} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 transition-all shadow-sm hover:shadow-red-500/20 group/btn" title="Annuler"><XCircle size={18} className="group-hover/btn:scale-110 transition-transform" /></button>
                                    </>
                                  )}
                                  {conge.statut?.toLowerCase().includes('approuve') && (
                                    <button onClick={() => generateArreteDeService(conge)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all shadow-sm hover:shadow-blue-500/20 group/btn" title="Générer Arrêté"><FileText size={18} className="group-hover/btn:scale-110 transition-transform" /></button>
                                  )}
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
            </motion.div>
          )}

          {/* Choix Congés */}
          {activeView === 'choix-conges' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Planification des Congés</h1>
                  <p className="text-slate-500 font-medium mt-1">Gérez la campagne de recueil de choix de congés {selectedYear}</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm flex items-center">
                  <select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(parseInt(e.target.value))} 
                    className="bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-white font-bold h-10 px-4 cursor-pointer outline-none"
                  >
                    {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => <option key={y} value={y} className="text-slate-800">{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Choix</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white">{choixConges.length}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-slate-200 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Validés</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{choixConges.filter(c => c.statut === 'valide').length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">En Attente</p>
                      <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{choixConges.filter(c => c.statut === 'en_attente').length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sans Choix</p>
                      <p className="text-3xl font-black text-red-600 dark:text-red-400">{agents.filter(a => a.role === 'AGENT').length - choixConges.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table */}
              <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-md">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 px-6 py-5">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText size={18} className="text-emerald-500" /> Vœux exprimés
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {choixConges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Calendar size={32} className="opacity-50" />
                      </div>
                      <p className="font-semibold text-center">La campagne de {selectedYear} n'a recueilli aucun choix d'agent.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Agent / Profil</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Affectation</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Départ Souhaité</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Durée Prévue</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Statut Fiche</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                          {choixConges.map((choix: any, i) => (
                            <tr key={choix.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${i % 2 === 0 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'} text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                    {choix.nom?.charAt(0)}{choix.prenoms?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{choix.nom} {choix.prenoms}</p>
                                    <p className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded mt-1">Mat: {choix.matricule}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{choix.direction}</p>
                                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1"><Building2 size={12} /> {choix.fonction || '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {choix.dateDepartSouhaitee ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    <Calendar size={14} className="text-slate-400" /> 
                                    {new Date(choix.dateDepartSouhaitee).toLocaleDateString('fr-FR')}
                                  </span>
                                ) : <span className="text-slate-400 italic font-medium">-</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                                  <span className="font-black text-emerald-700 dark:text-emerald-400 mr-1">{choix.nombreJours || 30}</span>
                                  <span className="text-xs font-bold text-emerald-500 uppercase">jrs</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${choix.statut === 'en_attente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' : choix.statut === 'valide' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                  {choix.statut === 'en_attente' ? <Clock size={12} /> : choix.statut === 'valide' ? <CheckCircle size={12} /> : null}
                                  {choix.statut === 'en_attente' ? 'En traitement' : choix.statut === 'valide' ? 'Profil Validé' : choix.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Documents */}
          {activeView === 'documents' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Actes Administratifs</h2>
                <p className="text-slate-500 font-medium mt-1">Édition intelligente et suivi des notes d'arrêt / reprise de service</p>
              </div>

              <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-md">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 px-6 py-5">
                  <CardTitle className="flex items-center justify-between text-lg font-bold">
                    <span>Base Documentaire des Congés Validés</span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 font-bold text-xs">
                      {conges.filter(c => {
                        const s = c.statut?.toLowerCase() || '';
                        return s.includes('approuve') || s.includes('valid') || s.includes('en_cours') || s.includes('en cours');
                      }).length} dossiers
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                      <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
                      <p className="font-medium animate-pulse">Synchronisation des documents...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Identité / Direction</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Période du Congé</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut / Nature</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action Générateur PDF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                          {conges.filter(c => {
                            const s = c.statut?.toLowerCase() || '';
                            return s.includes('approuve') || s.includes('valid') || s.includes('en_cours') || s.includes('en cours');
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                  <FileText size={32} className="opacity-40" />
                                </div>
                                <span className="font-semibold block">Aucun dossier en attente d'édition documentaire.</span>
                                <span className="text-sm">Approuvez d'abord les demandes de congés pour générer les actes.</span>
                              </td>
                            </tr>
                          ) : conges.filter(c => {
                            const s = c.statut?.toLowerCase() || '';
                            return s.includes('approuve') || s.includes('valid') || s.includes('en_cours') || s.includes('en cours');
                          }).map((doc, i) => (
                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${i % 2 === 0 ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-purple-500'} text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                    {doc.nom?.charAt(0)}{doc.prenoms?.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{doc.nom} {doc.prenoms}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{doc.direction}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Départ D : {new Date(doc.date_depart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Reprise R : {new Date(doc.date_retour).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-2">
                                  <Badge className={`border-0 ${
                                    doc.statut?.toLowerCase().includes('cours') 
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  }`}>
                                    {doc.statut?.toLowerCase().includes('cours') ? 'En cours' : 'Approuvé'}
                                  </Badge>
                                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 border-0 hover:bg-slate-200">
                                    {doc.type}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <Button size="sm" onClick={() => generateArreteDeService(doc)} className="bg-white hover:bg-orange-50 dark:bg-slate-900 dark:hover:bg-orange-900/20 text-orange-600 border border-orange-200 dark:border-orange-800/50 transition-all font-bold shadow-sm">
                                    <FileText size={14} className="mr-2" /> 
                                    Fiche Cessation
                                  </Button>
                                  <Button size="sm" onClick={() => generateNoteReprise(doc)} className="bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800/50 transition-all font-bold shadow-sm">
                                    <FileText size={14} className="mr-2" /> 
                                    Fiche Reprise
                                  </Button>
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
            </motion.div>
          )}

          {/* Paramètres */}
          {activeView === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <Card className="border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-4 px-8 py-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center shadow-inner">
                    <Settings className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Paramètres & Administration</CardTitle>
                    <p className="text-sm font-medium text-slate-500">Sécurité, exportations, sauvegardes et journal d&apos;activité.</p>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                  {/* SÉCURITÉ */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Shield size={18} className="text-emerald-500" /> Sécurité
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-center hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                      <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">Mot de passe</p>
                         <p className="text-xs text-slate-500 mt-1">Dernière modification : {new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                      <Button onClick={() => { setActiveView('dashboard'); setMustChangePassword(true); }} className="bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold shadow-sm">
                        Modifier le mot de passe
                      </Button>
                    </div>
                  </div>

                  {/* EXPORTS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Download size={18} className="text-blue-500" /> Exportation de Données
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button onClick={async () => { try { await api.exportExcel('agents'); api.addLog('EXPORT', 'Export Excel des agents'); toast.success('Export des agents téléchargé !'); } catch { toast.error('Erreur export'); } }} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:scale-[1.02] active:scale-95 text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Users size={20} className="text-blue-600 dark:text-blue-400" /></div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Agents</p>
                        <p className="text-[10px] text-slate-500 mt-1">Fichier Excel (.xlsx)</p>
                      </button>
                      <button onClick={async () => { try { await api.exportExcel('conges'); api.addLog('EXPORT', 'Export Excel des congés'); toast.success('Export des congés téléchargé !'); } catch { toast.error('Erreur export'); } }} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:scale-[1.02] active:scale-95 text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Calendar size={20} className="text-emerald-600 dark:text-emerald-400" /></div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Congés</p>
                        <p className="text-[10px] text-slate-500 mt-1">Fichier Excel (.xlsx)</p>
                      </button>
                      <button onClick={async () => { try { await api.exportExcel('all'); api.addLog('EXPORT', 'Export Excel complet (Agents + Congés)'); toast.success('Export complet téléchargé !'); } catch { toast.error('Erreur export'); } }} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:scale-[1.02] active:scale-95 text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><FileSpreadsheet size={20} className="text-orange-600 dark:text-orange-400" /></div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Export Complet</p>
                        <p className="text-[10px] text-slate-500 mt-1">Agents + Congés (.xlsx)</p>
                      </button>
                    </div>
                  </div>

                  {/* SAUVEGARDE */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Database size={18} className="text-purple-500" /> Sauvegarde
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-center hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors">
                      <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">Sauvegarde complète</p>
                         <p className="text-xs text-slate-500 mt-1">Téléchargez une copie sécurisée de toutes les données (JSON).</p>
                      </div>
                      <Button onClick={async () => { try { await api.exportBackup(); api.addLog('BACKUP', 'Sauvegarde complète de la base de données'); toast.success('Sauvegarde téléchargée avec succès !'); } catch { toast.error('Erreur sauvegarde'); } }} className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 font-bold shadow-sm">
                        <Download size={16} className="mr-2" /> Télécharger le backup
                      </Button>
                    </div>
                  </div>

                  {/* JOURNAL D'ACTIVITÉ — SUPER_ADMIN ONLY */}
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Activity size={18} className="text-amber-500" /> Journal d&apos;Activité
                        </h3>
                        <Button size="sm" onClick={async () => { try { const data = await api.getLogs(); setAuditLogs(data); toast.success(`${data.length} entrées chargées`); } catch { toast.error('Erreur chargement logs'); } }} className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-bold text-xs">
                          Rafraîchir
                        </Button>
                      </div>
                      {auditLogs.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center">
                          <Activity size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">Cliquez sur &quot;Rafraîchir&quot; pour charger le journal.</p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden max-h-[400px] overflow-y-auto">
                          {auditLogs.map((log: { id: number; action: string; details: string; adminId: number; createdAt: string }) => (
                            <div key={log.id} className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-white dark:hover:bg-slate-900/50 transition-colors">
                              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                                log.action === 'EXPORT' ? 'bg-blue-500' : log.action === 'BACKUP' ? 'bg-purple-500' : log.action === 'CREATION' ? 'bg-emerald-500' : log.action === 'SUPPRESSION' ? 'bg-red-500' : 'bg-amber-500'
                              }`}>
                                {log.action?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{log.action}</p>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{log.details}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[10px] text-slate-400 font-semibold">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</p>
                                <p className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SESSION */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <LogOut size={18} className="text-red-500" /> Session
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-4 justify-between items-center hover:border-red-200 dark:hover:border-red-800/50 transition-colors">
                      <div>
                         <p className="font-bold text-slate-800 dark:text-slate-200">Déconnexion</p>
                         <p className="text-xs text-slate-500 mt-1">Fermez votre session DRH en toute sécurité.</p>
                      </div>
                      <Button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-bold shadow-sm">
                        Se déconnecter
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      {/* Agent Modal */}
      <AgentForm isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} onSuccess={fetchData} />

      {/* Conge Modal */}
      {showCongeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="border border-white/20 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 px-8 py-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Calendar size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Nouvelle Demande de Congé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 py-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Agent concerné</Label>
                  <select 
                    value={congeForm.employe_id} 
                    onChange={e => setCongeForm({ ...congeForm, employe_id: e.target.value })} 
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl px-4 py-3 shadow-inner transition-all"
                  >
                    <option value="">Sélectionner un agent...</option>
                    {agents.filter(a => a.role === 'AGENT').map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenoms} ({a.matricule})</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Date de départ</Label>
                    <Input 
                      type="date" 
                      value={congeForm.date_depart} 
                      onChange={e => setCongeForm({ ...congeForm, date_depart: e.target.value })} 
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 h-auto shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Type de congé</Label>
                    <select 
                      value={congeForm.type} 
                      onChange={e => setCongeForm({ ...congeForm, type: e.target.value })} 
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl px-4 py-3 shadow-inner transition-all"
                    >
                      <option value="Annuel">Annuel</option>
                      <option value="Exceptionnel">Exceptionnel</option>
                      <option value="Maladie">Maladie</option>
                      <option value="Maternité">Maternité</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Durée forfaitaire</Label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setCongeForm({ ...congeForm, duree: '14' })} 
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${congeForm.duree === '14' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-md shadow-emerald-500/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                    >
                      14 jours
                    </button>
                    <button 
                      onClick={() => setCongeForm({ ...congeForm, duree: '30' })} 
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${congeForm.duree === '30' ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-md shadow-emerald-500/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                    >
                      30 jours
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <Button variant="outline" className="rounded-xl px-6" onClick={() => setShowCongeModal(false)}>Annuler</Button>
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-6 shadow-lg shadow-orange-600/20" onClick={handleAddConge}>Confirmer l'ajout</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && passwordAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="border border-white/20 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50 px-8 py-5 flex flex-row items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${passwordAction.type === 'deleteAgent' ? 'bg-red-100 dark:bg-red-900/50' : passwordAction.type === 'confirm' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                  {passwordAction.type === 'confirm' ? <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    {passwordAction.type === 'confirm' ? 'Validation du Congé' : passwordAction.type === 'deleteAgent' ? 'Suppression d\'Agent' : passwordAction.type === 'editAgent' ? 'Modification d\'Agent' : 'Annulation du Congé'}
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Sécurisation de l&apos;action</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-8 py-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {passwordAction.type === 'deleteAgent' ? (
                    <>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">⚠ Suppression définitive</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{passwordAction.agentName}</p>
                      <p className="text-xs text-slate-500 mt-1">Cette action est irréversible.</p>
                    </>
                  ) : passwordAction.type === 'editAgent' ? (
                    <>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">✏ Modification du profil</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{passwordAction.agentName}</p>
                      <p className="text-xs text-slate-500 mt-1">Les données seront mises à jour.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{passwordAction.conge?.nom} {passwordAction.conge?.prenoms}</p>
                      <p className="text-xs text-slate-500 mt-1">Durée : {passwordAction.conge?.nombre_jours} jours</p>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Mot de passe Administrateur</Label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="Saisissez votre mot de passe..." 
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 h-auto shadow-inner"
                    autoFocus 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <Button variant="outline" className="rounded-xl px-6" onClick={() => { setShowPasswordModal(false); setPasswordAction(null); }}>Annuler</Button>
                  <Button 
                    className={`rounded-xl px-6 font-bold text-white shadow-lg ${
                      passwordAction.type === 'confirm' ? 'bg-orange-600 hover:bg-orange-500 shadow-emerald-500/20' 
                      : passwordAction.type === 'editAgent' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' 
                      : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                    }`} 
                    onClick={handleCongeAction}
                  >
                    {passwordAction.type === 'confirm' ? 'Confirmer' : passwordAction.type === 'editAgent' ? 'Enregistrer' : passwordAction.type === 'deleteAgent' ? 'Supprimer' : 'Annuler'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditAgentModal && editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
            <Card className="border border-white/20 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-white to-emerald-600 px-8 py-5">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings size={20} />
                  Modifier l&apos;Agent : {editingAgent.nom} {editingAgent.prenoms}
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">Matricule : {editingAgent.matricule}</p>
              </CardHeader>
              <CardContent className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Nom *</Label>
                    <Input value={editAgentForm.nom} onChange={e => setEditAgentForm({ ...editAgentForm, nom: e.target.value.toUpperCase() })} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Prénoms *</Label>
                    <Input value={editAgentForm.prenoms} onChange={e => setEditAgentForm({ ...editAgentForm, prenoms: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Genre</Label>
                    <select value={editAgentForm.sexe} onChange={e => setEditAgentForm({ ...editAgentForm, sexe: e.target.value })} className="w-full border rounded-lg px-4 py-2 bg-white dark:bg-slate-950 dark:border-slate-700">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Date d&apos;embauche</Label>
                    <Input type="date" value={editAgentForm.dateEmbauche} onChange={e => setEditAgentForm({ ...editAgentForm, dateEmbauche: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Direction *</Label>
                  <select value={editAgentForm.direction} onChange={e => setEditAgentForm({ ...editAgentForm, direction: e.target.value })} className="w-full border rounded-lg px-4 py-2 bg-white dark:bg-slate-950 dark:border-slate-700">
                    {DIRECTIONS.map(dir => <option key={dir} value={dir}>{dir}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Fonction</Label>
                    <Input value={editAgentForm.fonction} onChange={e => setEditAgentForm({ ...editAgentForm, fonction: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Téléphone</Label>
                    <Input value={editAgentForm.telephone} onChange={e => setEditAgentForm({ ...editAgentForm, telephone: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Email</Label>
                    <Input type="email" value={editAgentForm.email} onChange={e => setEditAgentForm({ ...editAgentForm, email: e.target.value })} />
                  </div>
                </div>
              </CardContent>
              <div className="border-t px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                <Button variant="outline" className="rounded-xl" onClick={() => { setShowEditAgentModal(false); setEditingAgent(null); }}>Annuler</Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6 shadow-lg shadow-blue-500/20"
                  onClick={() => {
                    setShowEditAgentModal(false);
                    setPasswordAction({ type: 'editAgent', agentId: editingAgent.id, agentName: `${editAgentForm.nom} ${editAgentForm.prenoms}`, editData: editAgentForm });
                    setConfirmPassword('');
                    setShowPasswordModal(true);
                  }}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Commune de Yopougon - Direction des Ressources Humaines</p>
          <p className="text-xs text-slate-400">Version 2.0.0</p>
        </div>
      </footer>
    </div>
  );
}
