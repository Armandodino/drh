import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export function LeavePlanning() {
    const [agents, setAgents] = useState<any[]>([]);
    const [conges, setConges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const getSolde = (agent: any) => {
        if (!agent.date_embauche) return agent.jours_conge_annuel || 30;
        const hireYear = new Date(agent.date_embauche).getFullYear();
        const yearsWorked = new Date().getFullYear() - hireYear + 1;
        const totalEntitled = yearsWorked * (agent.jours_conge_annuel || 30);
        const used = conges
            .filter(c => c.employe_id === agent.id && c.statut === 'Approuvé')
            .reduce((sum, c) => sum + (c.nombre_jours || 0), 0);
        return Math.max(0, totalEntitled - used);
    };

    // Stats calculation
    const soldeGlobal = agents.reduce((acc, agent) => acc + getSolde(agent), 0);
    const demandesAttente = conges.filter(c => c.statut === 'En attente').length;
    const agentsEnConge = conges.filter(c => c.statut === 'Approuvé').length;

    return (
        <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Planning & Suivi des Congés
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gérez les absences et les droits aux congés des agents municipaux.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Planifier un Congé
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
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nouvelle Demande de Congé</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employé</label>
                                    <select
                                        value={selectedAgentId}
                                        onChange={e => setSelectedAgentId(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
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
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Durée Prédéfinie</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setNewConge({ ...newConge, duree: '14' })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${newConge.duree === '14' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            14 jours
                                        </button>
                                        <button
                                            onClick={() => setNewConge({ ...newConge, duree: '30' })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-colors ${newConge.duree === '30' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            30 jours
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
                                    <button onClick={handleNewConge} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">Confirmer</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Congés Cumulés (Global)
                        </p>
                        <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-2 rounded-lg">
                            event_repeat
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {soldeGlobal} jours
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Demandes en Attente
                        </p>
                        <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                            pending_actions
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{demandesAttente}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Agents en Congé
                        </p>
                        <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-2 rounded-lg">
                            person_off
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{agentsEnConge}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-bold">Répertoire des Droits aux Congés</h3>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-48 text-slate-500">Chargement...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                        Agent
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                                        Direction
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">
                                        Droit Annuel
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">
                                        Solde Restant
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {agents.map(agent => (
                                    <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase overflow-hidden border">
                                                    {agent.nom.charAt(0)}{agent.prenoms.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{agent.nom} {agent.prenoms}</p>
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
        </>
    );
}
