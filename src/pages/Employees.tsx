import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { DIRECTIONS } from '../constants/directions';

export function Employees() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [newAgent, setNewAgent] = useState({
        matricule: '',
        nom: '',
        prenoms: '',
        sexe: 'M',
        direction: DIRECTIONS[0],
        fonction: '',
        telephone: '',
        email: ''
    });

    const fetchAgents = async () => {
        try {
            const data = await api.getAgents();
            setAgents(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des agents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleAddAgent = async () => {
        if (!newAgent.matricule || !newAgent.nom || !newAgent.prenoms) {
            return toast.error("Veuillez remplir les champs obligatoires (Matricule, Nom, Prénoms)");
        }

        try {
            await api.addAgent(newAgent);
            toast.success("Agent ajouté avec succès !");
            setShowModal(false);
            setNewAgent({
                matricule: '', nom: '', prenoms: '', sexe: 'M',
                direction: DIRECTIONS[0], fonction: '', telephone: '', email: ''
            });
            fetchAgents();
        } catch (err) {
            toast.error("Erreur lors de l'ajout de l'agent");
        }
    };

    const filteredAgents = agents.filter(agent =>
        (agent.nom + ' ' + agent.prenoms).toLowerCase().includes(search.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: agents.length,
        admin: agents.filter(a => a.direction?.toLowerCase().includes('ressources humaines')).length,
        tech: agents.filter(a => a.direction?.toLowerCase().includes('techniques')).length,
        onLeave: agents.filter(a => a.statut?.toLowerCase() === 'en congé').length,
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Gestion du Personnel
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Consultez et gérez l'ensemble des agents municipaux de la commune.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-emerald-600/30"
                >
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    <span>Ajouter un employé</span>
                </button>
            </div>

            {/* Modal de création */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
                        >
                            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b pb-4">Nouvel Agent Municipal</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Matricule *</label>
                                    <input
                                        type="text"
                                        value={newAgent.matricule}
                                        onChange={e => setNewAgent({ ...newAgent, matricule: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        placeholder="Ex: 123456X"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Genre</label>
                                    <select
                                        value={newAgent.sexe}
                                        onChange={e => setNewAgent({ ...newAgent, sexe: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        value={newAgent.nom}
                                        onChange={e => setNewAgent({ ...newAgent, nom: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prénoms *</label>
                                    <input
                                        type="text"
                                        value={newAgent.prenoms}
                                        onChange={e => setNewAgent({ ...newAgent, prenoms: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Direction *</label>
                                    <select
                                        value={newAgent.direction}
                                        onChange={e => setNewAgent({ ...newAgent, direction: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {DIRECTIONS.map(dir => (
                                            <option key={dir} value={dir}>{dir}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fonction</label>
                                    <input
                                        type="text"
                                        value={newAgent.fonction}
                                        onChange={e => setNewAgent({ ...newAgent, fonction: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Ex: Chef de service"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label>
                                    <input
                                        type="text"
                                        value={newAgent.telephone}
                                        onChange={e => setNewAgent({ ...newAgent, telephone: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newAgent.email}
                                        onChange={e => setNewAgent({ ...newAgent, email: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Annuler</button>
                                <button onClick={handleAddAgent} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-600/20">Créer l'Agent</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Agents
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Administration
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {stats.admin}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Services Techniques
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {stats.tech}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        En Congés
                    </p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{stats.onLeave}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        search
                    </span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm outline-none"
                        placeholder="Rechercher par nom, matricule ou poste..."
                        type="text"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400 font-medium">Chargement des agents...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Employé
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Direction / Fonction
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                        Solde Congés (Annuel)
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucun agent trouvé</td>
                                    </tr>
                                ) : (
                                    filteredAgents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                                                        {agent.nom?.charAt(0)}{agent.prenoms?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {agent.nom} {agent.prenoms}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Mat: {agent.matricule}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{agent.direction}</p>
                                                <p className="text-xs text-slate-500">{agent.fonction}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                <p>{agent.telephone}</p>
                                                <p className="text-xs opacity-70">{agent.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {agent.jours_conge_annuel} jours
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${agent.statut?.toLowerCase() === 'actif' ? 'bg-emerald-100 text-emerald-700' :
                                                    agent.statut?.toLowerCase() === 'en congé' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {agent.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Affichage de {filteredAgents.length} employés
                    </p>
                </div>
            </div>
        </>
    );
}
