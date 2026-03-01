import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, FileText, Clock, Calendar, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { generateArreteDeService } from '../services/arretePdf';

export function LeavePlanning() {
    const [agents, setAgents] = useState<any[]>([]);
    const [conges, setConges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordAction, setPasswordAction] = useState<{type: 'confirm' | 'cancel', conge: any} | null>(null);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'droits' | 'demandes'>('demandes');

    // Form state
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [newConge, setNewConge] = useState({
        date_depart: '',
        type: 'Annuel',
        motif: '',
        duree: '30'
    });

    const fetchData = async () => {
        try {
            const [agentsData, congesData] = await Promise.all([
                api.getAgents(),
                api.getConges()
            ]);
            setAgents(agentsData);
            setConges(congesData);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNewConge = async () => {
        if (!selectedAgentId) return toast.error("Veuillez sélectionner un agent");
        if (!newConge.date_depart) return toast.error("Veuillez sélectionner une date de départ");

        try {
            const days = parseInt(newConge.duree);
            const date_retour = new Date(newConge.date_depart);
            date_retour.setDate(date_retour.getDate() + days);

            await api.addConge({
                employe_id: selectedAgentId,
                date_depart: newConge.date_depart,
                date_retour: date_retour.toISOString().split('T')[0],
                type: newConge.type,
                motif: newConge.motif,
                nombre_jours: days
            });

            setShowForm(false);
            setSelectedAgentId('');
            toast.success("Demande de congé enregistrée !");
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleConfirmConge = async (conge: any) => {
        setPasswordAction({ type: 'confirm', conge });
        setShowPasswordModal(true);
        setPassword('');
    };

    const handleCancelConge = async (conge: any) => {
        setPasswordAction({ type: 'cancel', conge });
        setShowPasswordModal(true);
        setPassword('');
    };

    const executePasswordAction = async () => {
        if (!passwordAction) return;
        
        try {
            // Vérifier le mot de passe
            const result = await api.verifyPassword(password);
            if (!result.valid) {
                toast.error("Mot de passe incorrect");
                return;
            }

            if (passwordAction.type === 'confirm') {
                // Approuver le congé
                await api.updateCongeStatus(passwordAction.conge.id, 'Approuvé');
                toast.success("Congé approuvé avec succès !");
                
                // Générer l'arrêté de service
                const agent = agents.find(a => a.id === passwordAction.conge.employe_id);
                generateArreteDeService({
                    ...passwordAction.conge,
                    nom: agent?.nom || passwordAction.conge.nom,
                    prenoms: agent?.prenoms || passwordAction.conge.prenoms,
                    matricule: agent?.matricule || passwordAction.conge.matricule,
                    fonction: agent?.fonction || passwordAction.conge.fonction,
                    direction: agent?.direction || passwordAction.conge.direction
                });
            } else {
                // Annuler le congé
                await api.updateCongeStatus(passwordAction.conge.id, 'Annulé');
                toast.success("Demande de congé annulée");
            }

            setShowPasswordModal(false);
            setPasswordAction(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'opération");
        }
    };

    const handleGenerateArrete = (conge: any) => {
        const agent = agents.find(a => a.id === conge.employe_id);
        generateArreteDeService({
            ...conge,
            nom: agent?.nom || conge.nom,
            prenoms: agent?.prenoms || conge.prenoms,
            matricule: agent?.matricule || conge.matricule,
            fonction: agent?.fonction || conge.fonction,
            direction: agent?.direction || conge.direction
        });
    };

    const getSolde = (agent: any) => {
        if (!agent.date_embauche) return agent.jours_conge_annuel || 30;
        const hireYear = new Date(agent.date_embauche).getFullYear();
        const yearsWorked = new Date().getFullYear() - hireYear + 1;
        const totalEntitled = yearsWorked * (agent.jours_conge_annuel || 30);
        const used = conges
            .filter(c => c.employe_id === agent.id && c.statut?.toLowerCase().includes('approuve'))
            .reduce((sum, c) => sum + (c.nombre_jours || 0), 0);
        const historique = agent.jours_pris_historique || 0;
        return Math.max(0, totalEntitled - used - historique);
    };

    // Stats calculation
    const soldeGlobal = agents.reduce((acc, agent) => acc + getSolde(agent), 0);
    const demandesAttente = conges.filter(c => c.statut?.toLowerCase().includes('attente'));
    const congesApprouves = conges.filter(c => c.statut?.toLowerCase().includes('approuve'));

    const getStatusBadge = (statut: string) => {
        const normalizedStatut = statut?.toLowerCase().replace('_', ' ');
        switch (normalizedStatut) {
            case 'en attente':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={12}/> En attente</span>;
            case 'approuve':
            case 'approuvé':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={12}/> Approuvé</span>;
            case 'annule':
            case 'annulé':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12}/> Annulé</span>;
            case 'en cours':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Clock size={12}/> En cours</span>;
            case 'termine':
            case 'terminé':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700"><CheckCircle size={12}/> Terminé</span>;
            case 'refuse':
            case 'refusé':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12}/> Refusé</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{statut}</span>;
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Planning & Suivi des Congés
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Gérez les absences et les droits aux congés des agents municipaux.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                    <Calendar size={18} />
                    Planifier un Congé
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Congés Cumulés</p>
                        <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Calendar size={18} className="text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{soldeGlobal} jours</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Demandes en Attente</p>
                        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{demandesAttente.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Congés Approuvés</p>
                        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle size={18} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{congesApprouves.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('demandes')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'demandes' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                >
                    Demandes de Congés
                </button>
                <button
                    onClick={() => setActiveTab('droits')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'droits' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                >
                    Droits aux Congés
                </button>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Nouvelle Demande de Congé</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employé</label>
                                    <select
                                        value={selectedAgentId}
                                        onChange={e => setSelectedAgentId(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Sélectionner un agent...</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.nom} {a.prenoms} ({a.matricule})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de départ</label>
                                    <input
                                        type="date"
                                        value={newConge.date_depart}
                                        onChange={e => setNewConge({ ...newConge, date_depart: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type de congé</label>
                                    <select
                                        value={newConge.type}
                                        onChange={e => setNewConge({ ...newConge, type: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="Annuel">Congé Annuel</option>
                                        <option value="Exceptionnel">Congé Exceptionnel</option>
                                        <option value="Maladie">Congé Maladie</option>
                                        <option value="Maternité">Congé Maternité</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Durée</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setNewConge({ ...newConge, duree: '14' })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${newConge.duree === '14' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            14 jours
                                        </button>
                                        <button
                                            onClick={() => setNewConge({ ...newConge, duree: '30' })}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${newConge.duree === '30' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            30 jours
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Annuler</button>
                                    <button onClick={handleNewConge} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Confirmer</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && passwordAction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => { setShowPasswordModal(false); setPasswordAction(null); }}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${passwordAction.type === 'confirm' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    <AlertTriangle size={20} className={passwordAction.type === 'confirm' ? 'text-emerald-600' : 'text-red-600'} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {passwordAction.type === 'confirm' ? 'Confirmer le congé' : 'Annuler la demande'}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {passwordAction.conge.nom} {passwordAction.conge.prenoms} - {passwordAction.conge.nombre_jours} jours
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Veuillez entrer votre mot de passe pour {passwordAction.type === 'confirm' ? 'approuver' : 'annuler'} cette demande.
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 mb-4"
                                autoFocus
                            />

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => { setShowPasswordModal(false); setPasswordAction(null); }}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={executePasswordAction}
                                    className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors ${passwordAction.type === 'confirm' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {passwordAction.type === 'confirm' ? 'Confirmer' : 'Annuler la demande'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content based on active tab */}
            {activeTab === 'demandes' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white">Demandes de Congés</h3>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-48 text-slate-500">Chargement...</div>
                    ) : conges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <Calendar size={40} className="mb-2 opacity-50" />
                            <p>Aucune demande de congé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th>
                                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Période</th>
                                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Jours</th>
                                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Type</th>
                                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                        <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {conges.map(conge => (
                                        <tr key={conge.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{conge.nom} {conge.prenoms}</p>
                                                    <p className="text-xs text-slate-500">{conge.matricule}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                                                <div>
                                                    <p>Du {new Date(conge.date_depart).toLocaleDateString('fr-FR')}</p>
                                                    <p>Au {new Date(conge.date_retour).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className="text-lg font-bold text-slate-800 dark:text-white">{conge.nombre_jours}</span>
                                            </td>
                                            <td className="px-5 py-3 text-center text-sm text-slate-600 dark:text-slate-300">
                                                {conge.type}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {getStatusBadge(conge.statut)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {conge.statut?.toLowerCase().includes('attente') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleConfirmConge(conge)}
                                                                className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                                                title="Approuver"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelConge(conge)}
                                                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                                title="Annuler"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {conge.statut?.toLowerCase().includes('approuve') && (
                                                        <button
                                                            onClick={() => handleGenerateArrete(conge)}
                                                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                            title="Générer Arrêté"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'droits' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white">Répertoire des Droits aux Congés</h3>
                    </div>
                    <div className="overflow-x-auto min-h-[300px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-48 text-slate-500">Chargement...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Agent</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Direction</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Droit Annuel</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Solde Restant</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {agents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden border">
                                                        {agent.nom?.charAt(0)}{agent.prenoms?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-800 dark:text-white">{agent.nom} {agent.prenoms}</p>
                                                        <p className="text-xs text-slate-500">Mat: {agent.matricule}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{agent.direction}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-sm font-semibold">
                                                    {agent.jours_conge_annuel} jours
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSolde(agent) > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                                                    {getSolde(agent)} jours
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
