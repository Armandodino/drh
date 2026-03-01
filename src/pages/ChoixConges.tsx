import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, AlertTriangle, CheckCircle, XCircle, Edit2, Settings } from 'lucide-react';
import api from '../services/api';

export function ChoixConges() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [choixConges, setChoixConges] = useState<any[]>([]);
    const [agentsManquants, setAgentsManquants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedChoix, setSelectedChoix] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [editForm, setEditForm] = useState({
        date_depart_souhaitee: '',
        nombre_jours: 30,
        observations: ''
    });
    const [actionType, setActionType] = useState<'valider' | 'refuser' | 'modifier'>('valider');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [choixData, manquantsData] = await Promise.all([
                api.getChoixConges(selectedYear),
                api.getAgentsManquantsChoix(selectedYear)
            ]);
            setChoixConges(choixData);
            setAgentsManquants(manquantsData);
        } catch (err) {
            console.error(err);
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const handleOpenEdit = (choix: any, action: 'valider' | 'refuser' | 'modifier') => {
        setSelectedChoix(choix);
        setActionType(action);
        setEditForm({
            date_depart_souhaitee: choix.date_depart_souhaitee?.split('T')[0] || '',
            nombre_jours: choix.nombre_jours || 30,
            observations: choix.observations || ''
        });
        setPassword('');
        
        if (action === 'modifier') {
            setShowEditModal(true);
        } else {
            setShowPasswordModal(true);
        }
    };

    const handleValidate = async () => {
        if (!selectedChoix) return;
        
        try {
            await api.validerChoixConge(selectedChoix.id, {
                password,
                statut: actionType === 'valider' ? 'valide' : 'refuse',
                observations: editForm.observations
            });
            toast.success(actionType === 'valider' ? 'Choix validé !' : 'Choix refusé');
            setShowPasswordModal(false);
            setSelectedChoix(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Mot de passe incorrect");
        }
    };

    const handleModify = async () => {
        if (!selectedChoix) return;
        
        try {
            await api.updateChoixConge(selectedChoix.id, {
                password,
                ...editForm
            });
            toast.success("Choix modifié avec succès !");
            setShowEditModal(false);
            setShowPasswordModal(false);
            setSelectedChoix(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Mot de passe incorrect");
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'en_attente':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">En attente</span>;
            case 'valide':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Validé</span>;
            case 'modifie':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Modifié</span>;
            case 'refuse':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Refusé</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{statut}</span>;
        }
    };

    // Stats
    const totalChoix = choixConges.length;
    const valides = choixConges.filter(c => c.statut === 'valide').length;
    const enAttente = choixConges.filter(c => c.statut === 'en_attente').length;
    const manquants = agentsManquants.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Planification des Congés Annuels
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Gérez les choix de congés des agents pour l'année {selectedYear}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(parseInt(e.target.value))}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Total choix</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white">{totalChoix}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Validés</p>
                            <p className="text-xl font-bold text-emerald-600">{valides}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">En attente</p>
                            <p className="text-xl font-bold text-amber-600">{enAttente}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase">Sans choix</p>
                            <p className="text-xl font-bold text-red-600">{manquants}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agents sans choix */}
            {manquants > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-200">
                                {manquants} agent(s) n'ont pas encore fait leur choix
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {agentsManquants.slice(0, 5).map((a: any) => (
                                    <span key={a.id} className="text-xs bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded">
                                        {a.nom} {a.prenoms}
                                    </span>
                                ))}
                                {manquants > 5 && (
                                    <span className="text-xs text-amber-600">+{manquants - 5} autres</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
                ) : choixConges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Calendar size={40} className="mb-2 opacity-50" />
                        <p>Aucun choix de congé pour {selectedYear}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Agent</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Direction</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Date départ souhaitée</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Durée</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {choixConges.map((choix: any) => (
                                    <tr key={choix.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                    {choix.nom} {choix.prenoms}
                                                </p>
                                                <p className="text-xs text-slate-500">{choix.matricule}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{choix.direction}</p>
                                            <p className="text-xs text-slate-400">{choix.fonction || '-'}</p>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {choix.date_depart_souhaitee ? (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {new Date(choix.date_depart_souhaitee).toLocaleDateString('fr-FR')}
                                                    </p>
                                                    {choix.date_retour_souhaitee && (
                                                        <p className="text-xs text-slate-400">
                                                            Retour: {new Date(choix.date_retour_souhaitee).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {choix.nombre_jours} jours
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {getStatutBadge(choix.statut)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {choix.statut === 'en_attente' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenEdit(choix, 'valider')}
                                                            className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                                            title="Valider"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(choix, 'refuser')}
                                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                            title="Refuser"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleOpenEdit(choix, 'modifier')}
                                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Édition */}
            <AnimatePresence>
                {showEditModal && selectedChoix && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Settings size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Modifier le choix</h3>
                                    <p className="text-sm text-slate-500">{selectedChoix.nom} {selectedChoix.prenoms}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Date de départ souhaitée
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.date_depart_souhaitee}
                                        onChange={e => setEditForm({...editForm, date_depart_souhaitee: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nombre de jours
                                    </label>
                                    <input
                                        type="number"
                                        value={editForm.nombre_jours}
                                        onChange={e => setEditForm({...editForm, nombre_jours: parseInt(e.target.value) || 30})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                        min="1"
                                        max="30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Observations
                                    </label>
                                    <textarea
                                        value={editForm.observations}
                                        onChange={e => setEditForm({...editForm, observations: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={() => { setShowEditModal(false); setShowPasswordModal(true); }}
                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                                >
                                    Continuer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Mot de passe */}
            <AnimatePresence>
                {showPasswordModal && selectedChoix && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => { setShowPasswordModal(false); setSelectedChoix(null); }}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    actionType === 'valider' ? 'bg-emerald-100' : 
                                    actionType === 'refuser' ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                    <AlertTriangle size={20} className={
                                        actionType === 'valider' ? 'text-emerald-600' : 
                                        actionType === 'refuser' ? 'text-red-600' : 'text-blue-600'
                                    } />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">
                                        {actionType === 'valider' ? 'Valider le choix' : 
                                         actionType === 'refuser' ? 'Refuser le choix' : 'Modifier le choix'}
                                    </h3>
                                    <p className="text-sm text-slate-500">Confirmation requise</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Entrez votre mot de passe pour confirmer :
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mb-4"
                                autoFocus
                            />

                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => { setShowPasswordModal(false); setSelectedChoix(null); }}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={actionType === 'modifier' ? handleModify : handleValidate}
                                    className={`px-4 py-2 text-sm font-bold text-white rounded-xl ${
                                        actionType === 'valider' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                        actionType === 'refuser' ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
