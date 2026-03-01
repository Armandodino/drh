import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, UserPlus, Calendar, Clock, TrendingUp, Users, Building2, UserCheck } from 'lucide-react';
import api from '../services/api';
import { DIRECTIONS } from '../constants/directions';
import { AgentForm } from '../components/AgentForm';

export function Employees() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const fetchAgents = async () => {
        try {
            const data = await api.getAgents();
            setAgents(data.filter((a: any) => a.role !== 'DEV' && a.role !== 'ADMIN_DRH'));
        } catch (err) {
            console.error("Erreur lors de la récupération des agents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const filteredAgents = agents.filter(agent =>
        (agent.nom + ' ' + agent.prenoms).toLowerCase().includes(search.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(search.toLowerCase()) ||
        agent.direction?.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const totalAgents = agents.length;
    const actifs = agents.filter(a => a.statut?.toLowerCase() === 'actif').length;
    const directions = [...new Set(agents.map(a => a.direction))].length;
    const ancienneteMoyenne = agents.reduce((sum, a) => {
        if (!a.date_embauche) return sum;
        const years = Math.floor((Date.now() - new Date(a.date_embauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return sum + years;
    }, 0) / (agents.filter(a => a.date_embauche).length || 1);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Gestion du Personnel
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Répertoire des agents municipaux de Yopougon
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20"
                >
                    <UserPlus size={18} />
                    Nouvel Agent
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Total Agents</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{totalAgents}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Actifs</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{actifs}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <UserCheck size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Directions</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{directions}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Building2 size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Ancienneté moy.</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{Math.round(ancienneteMoyenne)} ans</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                        placeholder="Rechercher par nom, matricule ou direction..."
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Direction</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Contact</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                                        <div className="flex items-center justify-center gap-1">
                                            <Calendar size={12} /> Embauche
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock size={12} /> Congés
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                                            Aucun agent trouvé
                                        </td>
                                    </tr>
                                ) : filteredAgents.map(agent => {
                                    // Calcul ancienneté
                                    let anciennete = 0;
                                    let joursAcquis = 0;
                                    if (agent.date_embauche) {
                                        const embauche = new Date(agent.date_embauche);
                                        anciennete = Math.floor((Date.now() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                        joursAcquis = anciennete * 30;
                                    }
                                    const joursPris = agent.jours_pris_historique || 0;
                                    const solde = Math.max(0, joursAcquis - joursPris);

                                    return (
                                        <tr key={agent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {agent.nom?.charAt(0)}{agent.prenoms?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                            {agent.nom} {agent.prenoms}
                                                        </p>
                                                        <p className="text-xs text-slate-500">Mat: {agent.matricule}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{agent.direction}</p>
                                                <p className="text-xs text-slate-400">{agent.fonction || '-'}</p>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-slate-500">
                                                <p>{agent.telephone || '-'}</p>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                {agent.date_embauche ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {new Date(agent.date_embauche).toLocaleDateString('fr-FR')}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{anciennete} an(s)</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`text-lg font-bold ${solde > 15 ? 'text-emerald-600' : solde > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {solde}j
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">solde</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    agent.statut?.toLowerCase() === 'actif' 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    {agent.statut || 'Actif'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    {filteredAgents.length} agent(s) affiché(s)
                </div>
            </div>

            {/* Modal Formulaire */}
            <AgentForm
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchAgents}
            />
        </>
    );
}
