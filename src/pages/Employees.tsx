import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Calendar, Clock, TrendingUp, Users, Building2, UserCheck, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { AgentForm } from '../components/AgentForm';

export function Employees() {
    const [agents, setAgents] = useState<any[]>([]);
    const [conges, setConges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [editForm, setEditForm] = useState({
        nom: '',
        prenoms: '',
        sexe: 'M',
        direction: '',
        fonction: '',
        telephone: '',
        email: '',
        date_embauche: '',
        jours_pris_historique: 0,
        statut: 'actif'
    });

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

    const fetchConges = async () => {
        try {
            const data = await api.getConges();
            setConges(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des congés", err);
        }
    };

    useEffect(() => {
        fetchAgents();
        fetchConges();
    }, []);

    const filteredAgents = agents.filter(agent =>
        (agent.nom + ' ' + agent.prenoms).toLowerCase().includes(search.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(search.toLowerCase()) ||
        agent.direction?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEditAgent = (agent: any) => {
        setSelectedAgent(agent);
        setEditForm({
            nom: agent.nom || '',
            prenoms: agent.prenoms || '',
            sexe: agent.sexe || 'M',
            direction: agent.direction || '',
            fonction: agent.fonction || '',
            telephone: agent.telephone || '',
            email: agent.email || '',
            date_embauche: agent.date_embauche ? agent.date_embauche.split('T')[0] : '',
            jours_pris_historique: agent.jours_pris_historique || 0,
            statut: agent.statut || 'actif'
        });
        setEditMode(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedAgent) return;
        
        try {
            await api.updateAgent(selectedAgent.id, editForm);
            toast.success("Agent modifié avec succès !");
            setEditMode(false);
            setSelectedAgent(null);
            fetchAgents();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la modification");
        }
    };

    const handleDeleteClick = (agent: any) => {
        setAgentToDelete(agent);
        setShowDeleteModal(true);
        setPassword('');
    };

    const handleConfirmDelete = async () => {
        if (!agentToDelete) return;
        
        try {
            await api.deleteAgent(agentToDelete.id, password);
            toast.success("Agent supprimé avec succès !");
            setShowDeleteModal(false);
            setAgentToDelete(null);
            fetchAgents();
        } catch (err: any) {
            toast.error(err.message || "Mot de passe incorrect ou erreur");
        }
    };

    // Stats
    const totalAgents = agents.length;
    const actifs = agents.filter(a => a.statut?.toLowerCase() === 'actif').length;
    const directions = [...new Set(agents.map(a => a.direction))].length;
    const ancienneteMoyenne = agents.reduce((sum, a) => {
        if (!a.date_embauche) return sum;
        const years = Math.floor((Date.now() - new Date(a.date_embauche).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return sum + years;
    }, 0) / (agents.filter(a => a.date_embauche).length || 1);

    // Calcul du solde pour un agent
    const getSoldeAgent = (agent: any) => {
        if (!agent.date_embauche) return 0;
        const embauche = new Date(agent.date_embauche);
        const today = new Date();
        const annees = Math.floor((today.getTime() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const acquis = annees * 30;
        const pris = conges
            .filter((c: any) => c.employe_id === agent.id && c.statut?.toLowerCase().includes('approuve'))
            .reduce((sum: number, c: any) => sum + (c.nombre_jours || 0), 0);
        const historique = agent.jours_pris_historique || 0;
        return Math.max(0, acquis - pris - historique);
    };

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
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                                            Aucun agent trouvé
                                        </td>
                                    </tr>
                                ) : filteredAgents.map(agent => {
                                    // Calcul ancienneté
                                    let anciennete = 0;
                                    if (agent.date_embauche) {
                                        const embauche = new Date(agent.date_embauche);
                                        anciennete = Math.floor((Date.now() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                    }
                                    const solde = getSoldeAgent(agent);

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
                                                <p className="text-xs">{agent.email || ''}</p>
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
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditAgent(agent)}
                                                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(agent)}
                                                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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

            {/* Modal Formulaire Nouvel Agent */}
            <AgentForm
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchAgents}
            />

            {/* Modal Modification Agent */}
            <AnimatePresence>
                {editMode && selectedAgent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setEditMode(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 size={20} className="text-blue-600" />
                                Modifier l'Agent
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                                    <input
                                        value={editForm.nom}
                                        onChange={e => setEditForm({...editForm, nom: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénoms</label>
                                    <input
                                        value={editForm.prenoms}
                                        onChange={e => setEditForm({...editForm, prenoms: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sexe</label>
                                    <select
                                        value={editForm.sexe}
                                        onChange={e => setEditForm({...editForm, sexe: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    >
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Direction</label>
                                    <input
                                        value={editForm.direction}
                                        onChange={e => setEditForm({...editForm, direction: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fonction</label>
                                    <input
                                        value={editForm.fonction}
                                        onChange={e => setEditForm({...editForm, fonction: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
                                    <input
                                        value={editForm.telephone}
                                        onChange={e => setEditForm({...editForm, telephone: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'embauche</label>
                                    <input
                                        type="date"
                                        value={editForm.date_embauche}
                                        onChange={e => setEditForm({...editForm, date_embauche: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jours pris (avant système)</label>
                                    <input
                                        type="number"
                                        value={editForm.jours_pris_historique}
                                        onChange={e => setEditForm({...editForm, jours_pris_historique: parseInt(e.target.value) || 0})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                                    <select
                                        value={editForm.statut}
                                        onChange={e => setEditForm({...editForm, statut: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    >
                                        <option value="actif">Actif</option>
                                        <option value="inactif">Inactif</option>
                                        <option value="retraite">Retraité</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    onClick={() => setEditMode(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Suppression Agent */}
            <AnimatePresence>
                {showDeleteModal && agentToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => { setShowDeleteModal(false); setAgentToDelete(null); }}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supprimer l'agent</h3>
                                    <p className="text-sm text-slate-500">Cette action est irréversible</p>
                                </div>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    {agentToDelete.nom} {agentToDelete.prenoms}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {agentToDelete.matricule} - {agentToDelete.direction}
                                </p>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Entrez votre mot de passe pour confirmer la suppression :
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-500 mb-4"
                                autoFocus
                            />

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => { setShowDeleteModal(false); setAgentToDelete(null); }}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
