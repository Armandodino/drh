'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Calendar, 
  Users, 
  FileText, 
  Home as HomeIcon,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Menu,
  FileDown,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

// Types
interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  direction: string;
  service: string;
  soldeConges: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

interface Conge {
  id: string;
  agentId: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  statut: 'en_attente' | 'approuve' | 'refuse';
  nbJours: number;
  agent?: {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    direction: string;
    service?: string;
    fonction?: string;
  };
}

// Login Page Component
function LoginPage({ onLogin }: { onLogin: (user: Agent) => void }) {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Matricule ou mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/90 via-[#16213e]/80 to-[#0f3460]/70" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-24 h-24 relative">
              <Image
                src="/AbidjanLogo.png"
                alt="Logo Yopougon"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              <span className="text-white">DRH </span>
              <span className="text-emerald-500">Yopougon</span>
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Mairie de Yopougon
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MATRICULE
              </label>
              <Input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="bg-gray-100 border-0 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500"
                placeholder="Entrez votre matricule"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MOT DE PASSE
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-100 border-0 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 pr-10"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-emerald-500 hover:from-orange-600 hover:to-emerald-600 text-white font-semibold py-6 text-base shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Accès restreint au personnel autorisé
          </p>
        </CardContent>
      </Card>

      {/* Copyright */}
      <div className="absolute bottom-4 left-4 z-10">
        <p className="text-xs text-white/60">© 2026 Commune de Yopougon</p>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ 
  user, 
  onLogout 
}: { 
  user: Agent; 
  onLogout: () => void;
}) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowSettings(false);
    };

    if (showNotifications || showSettings) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications, showSettings]);
  
  // Sample notifications
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle demande de congé',
      message: 'Koné Amadou a soumis une demande de congé annuel',
      type: 'info',
      date: '2026-03-03',
      read: false,
    },
    {
      id: '2',
      title: 'Congé approuvé',
      message: 'Votre demande de congé a été approuvée',
      type: 'success',
      date: '2026-03-02',
      read: false,
    },
    {
      id: '3',
      title: 'Rappel',
      message: 'Solde de congés bas: 5 jours restants',
      type: 'warning',
      date: '2026-03-01',
      read: true,
    },
  ]);

  const [conges, setConges] = useState<Conge[]>([]);
  const [loadingConges, setLoadingConges] = useState(true);
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);

  // Fetch conges from API
  useEffect(() => {
    const fetchConges = async () => {
      try {
        const res = await fetch('/api/conges');
        const data = await res.json();
        if (data.conges) {
          setConges(data.conges);
        }
      } catch (error) {
        console.error('Error fetching conges:', error);
      } finally {
        setLoadingConges(false);
      }
    };
    fetchConges();
  }, []);

  const generateDocument = async (type: 'cessation' | 'reprise', congeId: string) => {
    setGeneratingDoc(congeId + type);
    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, congeId }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la génération du document');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${congeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Erreur lors de la génération du document');
    } finally {
      setGeneratingDoc(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'approuve':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approuvé</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Refusé</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/AbidjanLogo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">DRH Yopougon</h1>
              <p className="text-gray-400 text-xs">Mairie de Yopougon</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium">
            <HomeIcon className="h-5 w-5" />
            Tableau de bord
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition">
            <Users className="h-5 w-5" />
            Agents
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition">
            <Calendar className="h-5 w-5" />
            Congés
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition">
            <FileText className="h-5 w-5" />
            Demandes
          </button>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.prenom} {user.nom}</p>
              <p className="text-gray-400 text-xs truncate">{user.direction}</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-gray-400 hover:text-red-400 transition"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4 relative">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-gray-800">Tableau de bord</h2>
              <p className="text-sm text-gray-500">Bienvenue, {user.prenom} {user.nom}</p>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 relative">
              {/* Notification Icon */}
              <button 
                className="relative p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
              >
                <Bell className="h-5 w-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Settings Icon */}
              <button 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}

              {/* Settings Dropdown */}
              {showSettings && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition text-left">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Mon profil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition text-left">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Paramètres</span>
                    </button>
                    <hr className="my-2 border-gray-100" />
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Agents</p>
                    <p className="text-2xl font-bold mt-1">156</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">En Congé</p>
                    <p className="text-2xl font-bold mt-1">12</p>
                  </div>
                  <Calendar className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">En Attente</p>
                    <p className="text-2xl font-bold mt-1">8</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Approuvés</p>
                    <p className="text-2xl font-bold mt-1">24</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Leaves */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Demandes récentes
                </CardTitle>
                {loadingConges && (
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement...
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Agent</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Période</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Jours</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conges.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Aucune demande de congé trouvée
                        </td>
                      </tr>
                    ) : (
                      conges.map((conge) => (
                        <tr key={conge.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium text-gray-800">
                                {conge.agent?.prenom} {conge.agent?.nom}
                              </span>
                              <p className="text-xs text-gray-500">{conge.agent?.matricule}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-800">{conge.type}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(conge.dateDebut).toLocaleDateString('fr-FR')} → {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {conge.nbJours} jours
                          </td>
                          <td className="py-3 px-4">
                            {getStatutBadge(conge.statut)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => generateDocument('cessation', conge.id)}
                                disabled={generatingDoc === conge.id + 'cessation' || conge.statut !== 'approuve'}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Générer certificat de cessation"
                              >
                                {generatingDoc === conge.id + 'cessation' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileDown className="h-3 w-3" />
                                )}
                                Cessation
                              </button>
                              <button
                                onClick={() => generateDocument('reprise', conge.id)}
                                disabled={generatingDoc === conge.id + 'reprise' || conge.statut !== 'approuve'}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Générer certificat de reprise"
                              >
                                {generatingDoc === conge.id + 'reprise' ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileDown className="h-3 w-3" />
                                )}
                                Reprise
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2026 Commune de Yopougon - DRH</p>
            <p>Système de Gestion des Congés</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Main Page Component
export default function Home() {
  const [user, setUser] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Seed demo user
    fetch('/api/seed', { method: 'POST' }).catch(console.error);
  }, []);

  const handleLogin = (loggedInUser: Agent) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
