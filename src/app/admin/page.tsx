'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Store,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Toast Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-slide-in-right ${
      type === 'success' 
        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
        : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
    }`}>
      {type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    checkAuth();
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      }
    } catch {
      console.error('Auth check error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
      } else {
        setLoginError(data.error || 'Identifiants incorrects');
      }
    } catch {
      setLoginError('Erreur de connexion au serveur');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAdmin(null);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent animate-pulse opacity-20"></div>
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
              <Image src="/images/logo-store.jpeg" alt="Logo" fill className="object-cover" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-gray-600 font-medium">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen - Professional Design
  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl bg-white p-1">
                <Image src="/images/logo-store.jpeg" alt="Logo" fill className="object-cover rounded-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Oluwatobi</h1>
                <p className="text-orange-400 text-lg font-medium">Quincaillerie</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="py-12">
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Bienvenue sur<br />
                <span className="text-orange-400">votre espace</span>
              </h2>
              <p className="text-gray-400 text-xl max-w-lg leading-relaxed">
                Gérez votre boutique en toute simplicité. Tableau de bord professionnel pour vos produits, commandes et clients.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Package, label: 'Produits', desc: 'Gestion complète' },
                { icon: ShoppingCart, label: 'Commandes', desc: 'Suivi en temps réel' },
                { icon: FolderTree, label: 'Catégories', desc: 'Organisation simple' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <span className="text-white font-semibold block">{item.label}</span>
                    <span className="text-gray-500 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl bg-white p-1 mb-4 border border-gray-100">
                <Image src="/images/logo-store.jpeg" alt="Logo" fill className="object-cover rounded-xl" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">Oluwatobi</h1>
                <p className="text-orange-600 font-medium">Quincaillerie</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg shadow-orange-500/25">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
                <p className="text-gray-500">Accédez à votre espace administrateur</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="admin@oluwaquincaillerie.ci"
                      required
                      className="pl-12 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="pl-12 pr-12 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-4 rounded-xl">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{loginError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
                  disabled={loggingIn}
                >
                  {loggingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <Separator />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-400 -translate-y-1/2 top-1/2 absolute">ou</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 font-medium border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la boutique
              </Button>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-center text-xs text-gray-500 mb-2">
                  🔐 Identifiants de démonstration
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <code className="bg-white px-3 py-2 rounded-lg text-gray-700 font-mono text-xs border border-gray-200 text-center">
                    admin@oluwaquincaillerie.ci
                  </code>
                  <code className="bg-white px-3 py-2 rounded-lg text-gray-700 font-mono text-xs border border-gray-200 text-center">
                    oluwa2024
                  </code>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              © {new Date().getFullYear()} Oluwatobi Quincaillerie. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-transform duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-white p-0.5">
              <Image src="/images/logo-store.jpeg" alt="Logo" fill className="object-cover rounded-lg" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Oluwatobi</p>
              <p className="text-xs text-orange-400">Quincaillerie Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1.5">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Tableau de bord' },
              { id: 'products', icon: Package, label: 'Produits' },
              { id: 'categories', icon: FolderTree, label: 'Catégories' },
              { id: 'orders', icon: ShoppingCart, label: 'Commandes' },
              { id: 'settings', icon: Settings, label: 'Paramètres' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/25' 
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold shadow-lg text-white">
              {admin.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name}</p>
              <p className="text-xs text-gray-500 truncate">{admin.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-400 hover:text-white hover:bg-white/10 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              {activeTab === 'overview' && 'Tableau de bord'}
              {activeTab === 'products' && 'Gestion des produits'}
              {activeTab === 'categories' && 'Gestion des catégories'}
              {activeTab === 'orders' && 'Gestion des commandes'}
              {activeTab === 'settings' && 'Paramètres'}
            </h1>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search (Desktop) */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-48 lg:w-64"
              />
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 rounded-xl"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="px-4 py-3 font-semibold text-gray-900 flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary" className="text-xs">3 nouvelles</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <ScrollArea className="h-72">
                  <DropdownMenuItem className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer hover:bg-orange-50 focus:bg-orange-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="font-medium text-sm text-gray-900">Nouvelle commande</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-4">Commande #CMD-2024-001 reçue</p>
                    <span className="text-[10px] text-gray-400 pl-4">Il y a 5 min</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="font-medium text-sm text-gray-900">Stock faible</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-4">Marteau - 3 unités restantes</p>
                    <span className="text-[10px] text-gray-400 pl-4">Il y a 1h</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer hover:bg-green-50 focus:bg-green-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium text-sm text-gray-900">Paiement confirmé</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-4">Commande #CMD-2024-002 payée</p>
                    <span className="text-[10px] text-gray-400 pl-4">Il y a 2h</span>
                  </DropdownMenuItem>
                </ScrollArea>
                <DropdownMenuSeparator className="m-0" />
                <div className="p-2">
                  <Button variant="ghost" className="w-full text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                    Voir toutes les notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-gray-100 rounded-xl ${activeTab === 'settings' ? 'bg-orange-50 text-orange-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* View Store Button */}
            <Button variant="outline" size="sm" onClick={() => router.push('/')} className="hidden sm:flex ml-2">
              <Store className="h-4 w-4 mr-2" />
              Voir la boutique
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === 'overview' && <OverviewTab showToast={showToast} />}
          {activeTab === 'products' && <ProductsTab showToast={showToast} />}
          {activeTab === 'categories' && <CategoriesTab showToast={showToast} />}
          {activeTab === 'orders' && <OrdersTab showToast={showToast} />}
          {activeTab === 'settings' && <SettingsTab showToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ============ TAB COMPONENTS ============

function OverviewTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, pendingOrders: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          fetch('/api/products'), fetch('/api/categories'), fetch('/api/orders'),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];
        setStats({
          products: productsData.products?.length || 0,
          categories: categoriesData.categories?.length || 0,
          orders: orders.length,
          pendingOrders: orders.filter((o: { status: string }) => o.status === 'pending').length,
        });
      } catch { showToast('Erreur lors du chargement des statistiques', 'error'); }
    }
    fetchStats();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produits', value: stats.products, color: 'from-blue-500 to-blue-600' },
          { label: 'Catégories', value: stats.categories, color: 'from-purple-500 to-purple-600' },
          { label: 'Commandes', value: stats.orders, color: 'from-green-500 to-green-600' },
          { label: 'En attente', value: stats.pendingOrders, color: 'from-primary to-accent' },
        ].map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${stat.color} p-4 md:p-6 text-white`}>
                <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Bienvenue sur votre tableau de bord</CardTitle>
          <CardDescription>Gérez votre boutique Oluwatobi Quincaillerie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl border border-primary-100">
              <h3 className="font-semibold text-primary-800 mb-2">💡 Conseil</h3>
              <p className="text-sm text-primary-700">Ajoutez des images à vos produits pour augmenter les ventes de 3x.</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">📱 Mobile</h3>
              <p className="text-sm text-blue-700">L&apos;interface est optimisée pour mobile. Gérez votre boutique partout!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [products, setProducts] = useState<Array<{
    id: string; name: string; price: number; stock: number; featured: boolean; active: boolean; image: string | null; category: { id: string; name: string } | null;
  }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', oldPrice: '', stock: '', categoryId: '', featured: false, active: true, image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch { showToast('Erreur lors du chargement', 'error'); }
    finally { setLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) { showToast('Image trop volumineuse (max 5MB)', 'error'); return; }
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'products');
      const response = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      const data = await response.json();
      if (response.ok) {
        setFormData({ ...formData, image: data.url });
        showToast('Image téléchargée', 'success');
      } else { showToast(data.error || 'Erreur', 'error'); }
    } catch { showToast('Erreur lors du téléchargement', 'error'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct}` : '/api/products';
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        showToast(editingProduct ? 'Produit modifié' : 'Produit ajouté', 'success');
        fetchData();
        resetForm();
      } else { showToast('Erreur lors de l\'enregistrement', 'error'); }
    } catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (product: typeof products[0]) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name, description: '', price: product.price.toString(), oldPrice: '',
      stock: product.stock.toString(), categoryId: product.category?.id || '',
      featured: product.featured, active: product.active, image: product.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      showToast('Produit supprimé', 'success');
      fetchData();
    } catch { showToast('Erreur', 'error'); }
  };

  const resetForm = () => {
    setShowForm(false); setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', oldPrice: '', stock: '', categoryId: '', featured: false, active: true, image: '' });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">{products.length} produits</h2>
        <Button onClick={() => setShowForm(true)} className="btn-primary text-white">
          <Package className="h-4 w-4 mr-2" /> Ajouter un produit
        </Button>
      </div>

      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Image du produit</Label>
                <div className="flex flex-col sm:flex-row items-start gap-4 mt-2">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {formData.image ? <img src={formData.image} alt="Aperçu" className="w-full h-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Téléchargement...</> : <><Upload className="h-4 w-4 mr-2" /> Choisir une image</>}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF ou WebP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-1" /></div>
                <div><Label>Catégorie</Label>
                  <select className="w-full border rounded-lg px-3 py-2 mt-1" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                    <option value="">Sélectionner</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
                <div><Label>Prix (FCFA) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="mt-1" /></div>
                <div><Label>Ancien prix (FCFA)</Label><Input type="number" value={formData.oldPrice} onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })} className="mt-1" /></div>
                <div><Label>Stock *</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="mt-1" /></div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-primary" /> Vedette</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 accent-primary" /> Actif</label>
                </div>
              </div>
              <div><Label>Description</Label><textarea className="w-full border rounded-lg px-3 py-2 min-h-[100px] mt-1" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="flex gap-2">
                <Button type="submit" className="btn-primary text-white" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="h-4 w-4 mr-2" /> {editingProduct ? 'Modifier' : 'Ajouter'}</>}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-gray-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category?.name || 'Sans catégorie'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-primary">{product.price.toLocaleString()} FCFA</p>
                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="text-xs">{product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(product)}>Modifier</Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Image</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nom</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Catégorie</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Prix</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-400" /></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="font-medium">{product.name}</p>{product.featured && <Badge className="bg-primary-100 text-primary-700 text-xs mt-1">Vedette</Badge>}</td>
                    <td className="px-6 py-4 text-gray-500">{product.category?.name || '-'}</td>
                    <td className="px-6 py-4 text-right font-semibold">{product.price.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-right"><span className={product.stock === 0 ? 'text-red-500 font-medium' : ''}>{product.stock}</span></td>
                    <td className="px-6 py-4 text-center"><Badge variant={product.active ? 'default' : 'secondary'}>{product.active ? 'Actif' : 'Inactif'}</Badge></td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(product)}>Modifier</Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(product.id)}>Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; description: string | null; active: boolean; _count?: { products: number } }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', active: true });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch { showToast('Erreur', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory}` : '/api/categories';
      const response = await fetch(url, { method: editingCategory ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (response.ok) { showToast(editingCategory ? 'Catégorie modifiée' : 'Catégorie ajoutée', 'success'); fetchCategories(); resetForm(); }
    } catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (category: typeof categories[0]) => { setEditingCategory(category.id); setFormData({ name: category.name, description: category.description || '', active: category.active }); setShowForm(true); };
  const handleDelete = async (id: string) => { if (!confirm('Supprimer?')) return; try { await fetch(`/api/categories/${id}`, { method: 'DELETE' }); showToast('Catégorie supprimée', 'success'); fetchCategories(); } catch { showToast('Erreur', 'error'); } };
  const resetForm = () => { setShowForm(false); setEditingCategory(null); setFormData({ name: '', description: '', active: true }); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{categories.length} catégories</h2>
        <Button onClick={() => setShowForm(true)} className="btn-primary text-white">Ajouter une catégorie</Button>
      </div>
      {showForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle>{editingCategory ? 'Modifier' : 'Ajouter'} une catégorie</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-1" /></div>
              <div><Label>Description</Label><textarea className="w-full border rounded-lg px-3 py-2 min-h-[100px] mt-1" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 accent-primary" /> Active</label>
              <div className="flex gap-2">
                <Button type="submit" className="btn-primary text-white" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}{editingCategory ? 'Modifier' : 'Ajouter'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant={category.active ? 'default' : 'secondary'}>{category.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{category.description || 'Pas de description'}</p>
              <p className="text-sm text-gray-600 mb-4">{category._count?.products || 0} produits</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>Modifier</Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(category.id)}>Supprimer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [orders, setOrders] = useState<Array<{ id: string; customerName: string; customerPhone: string; customerAddress?: string; status: string; total: number; createdAt: string; items: Array<{ product: { name: string }; quantity: number; price: number }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter !== 'all' ? `/api/orders?status=${filter}` : '/api/orders';
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch { showToast('Erreur', 'error'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      showToast('Statut mis à jour', 'success');
      fetchOrders();
    } catch { showToast('Erreur', 'error'); }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'En attente' },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Confirmée' },
    shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Expédiée' },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Livrée' },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Annulée' },
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{orders.length} commandes</h2>
        <select className="border rounded-lg px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          {Object.entries(statusConfig).map(([value, config]) => (<option key={value} value={value}>{config.label}</option>))}
        </select>
      </div>
      {orders.length === 0 ? (
        <Card className="border-0 shadow-md"><CardContent className="py-12 text-center text-gray-500">Aucune commande</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-lg">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    {order.customerAddress && <p className="text-sm text-gray-400">{order.customerAddress}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="sm:text-right">
                    <Badge className={statusConfig[order.status]?.color + ' border'}>{statusConfig[order.status]?.label}</Badge>
                    <p className="text-xl font-bold text-primary mt-2">{order.total.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">{order.items.map((item, index) => (<div key={index} className="flex justify-between text-sm"><span>{item.quantity}x {item.product?.name || 'Produit'}</span><span className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</span></div>))}</div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">Changer le statut:</span>
                  <select className="border rounded-lg px-2 py-1 text-sm" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                    {Object.entries(statusConfig).map(([value, config]) => (<option key={value} value={value}>{config.label}</option>))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data.settings || {});
    } catch { showToast('Erreur', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      showToast('Paramètres enregistrés', 'success');
    } catch { showToast('Erreur', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <Card className="border-0 shadow-lg">
        <CardHeader><CardTitle>Paramètres de la boutique</CardTitle><CardDescription>Configurez les informations de votre magasin</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'storeName', label: 'Nom de la boutique' },
              { key: 'whatsappNumber', label: 'Numéro WhatsApp', placeholder: '+225 07 07 15 54 14' },
              { key: 'storeAddress', label: 'Adresse' },
              { key: 'storeEmail', label: 'Email', type: 'email' },
              { key: 'storePhone', label: 'Téléphone' },
              { key: 'currency', label: 'Devise' },
            ].map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input type={field.type || 'text'} value={settings[field.key] || ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} placeholder={field.placeholder} className="mt-1" />
              </div>
            ))}
            <div><Label>Message de bienvenue</Label><textarea className="w-full border rounded-lg px-3 py-2 min-h-[100px] mt-1" value={settings.welcomeMessage || ''} onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })} /></div>
            <Button type="submit" className="btn-primary text-white" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enregistrement...</> : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
