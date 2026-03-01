import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Calendar, Check } from 'lucide-react';
import api from '../services/api';
import { generateNoteReprise } from '../services/noteReprisePdf';

export function Notifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [congesFinProche, setCongesFinProche] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notifications' | 'fin-proche'>('fin-proche');

    const fetchData = async () => {
        try {
            const [notificationsData, congesData] = await Promise.all([
                api.getNotifications(),
                api.getCongesFinProche()
            ]);
            setNotifications(notificationsData);
            setCongesFinProche(congesData);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Rafraîchir toutes les 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.markNotificationRead(id);
            fetchData();
        } catch (err) {
            toast.error("Erreur");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            toast.success("Toutes les notifications marquées comme lues");
            fetchData();
        } catch (err) {
            toast.error("Erreur");
        }
    };

    const handleGenerateNoteReprise = (conge: any) => {
        generateNoteReprise(conge);
        toast.success("Note de reprise générée !");
    };

    const handleActionDone = async (id: number) => {
        try {
            await api.notificationActionDone(id);
            toast.success("Action marquée comme effectuée");
            fetchData();
        } catch (err) {
            toast.error("Erreur");
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'fin_conge_3j':
                return <Clock className="text-amber-500" size={20} />;
            case 'fin_conge_1j':
                return <AlertTriangle className="text-red-500" size={20} />;
            case 'nouveau_choix':
                return <Calendar className="text-blue-500" size={20} />;
            case 'demande_conge':
                return <FileText className="text-purple-500" size={20} />;
            default:
                return <Bell className="text-slate-500" size={20} />;
        }
    };

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case 'fin_conge_3j':
                return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">3 jours</span>;
            case 'fin_conge_1j':
                return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">URGENT</span>;
            case 'nouveau_choix':
                return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">Nouveau</span>;
            default:
                return null;
        }
    };

    const unreadCount = notifications.filter(n => !n.est_lue).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Centre de Notifications
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Gérez les alertes et les fins de congés
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400"
                    >
                        <Check size={16} />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('fin-proche')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'fin-proche' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    <AlertTriangle size={16} />
                    Fin de congé proche ({congesFinProche.length})
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        activeTab === 'notifications' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    <Bell size={16} />
                    Notifications ({unreadCount})
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
            ) : (
                <>
                    {/* Tab: Fin de congé proche */}
                    {activeTab === 'fin-proche' && (
                        <div className="space-y-4">
                            {congesFinProche.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                                    <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                                    <p className="text-slate-500">Aucun congé ne se termine dans les 3 prochains jours</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {congesFinProche.map((conge: any) => (
                                        <motion.div
                                            key={conge.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-5 shadow-sm ${
                                                conge.jours_restants <= 1 
                                                    ? 'border-red-300 dark:border-red-800' 
                                                    : 'border-amber-300 dark:border-amber-800'
                                            }`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                        conge.jours_restants <= 1 
                                                            ? 'bg-red-100 text-red-600' 
                                                            : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                        {conge.jours_restants <= 1 ? (
                                                            <AlertTriangle size={24} />
                                                        ) : (
                                                            <Clock size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">
                                                            {conge.nom} {conge.prenoms}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {conge.matricule} • {conge.direction}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                conge.jours_restants <= 1 
                                                                    ? 'bg-red-100 text-red-700' 
                                                                    : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {conge.jours_restants <= 1 
                                                                    ? 'FIN DEMAIN' 
                                                                    : `Fin dans ${conge.jours_restants} jours`}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                                                                Du {new Date(conge.date_depart).toLocaleDateString('fr-FR')} au {new Date(conge.date_retour).toLocaleDateString('fr-FR')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleGenerateNoteReprise(conge)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-all"
                                                >
                                                    <FileText size={16} />
                                                    Générer Note de Reprise
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Aucune notification</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifications.map((notif: any) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                !notif.est_lue ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                            {notif.titre}
                                                        </p>
                                                        {getNotificationBadge(notif.type)}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(notif.date_notification).toLocaleString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!notif.est_lue && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notif.id)}
                                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                                                            title="Marquer comme lu"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    {notif.action_requise && !notif.action_effectuee && (
                                                        <button
                                                            onClick={() => handleActionDone(notif.id)}
                                                            className="p-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600"
                                                            title="Marquer comme effectué"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
