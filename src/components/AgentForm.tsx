import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Briefcase, Phone, Mail, Clock, History, ChevronDown, ChevronUp, Plus, Trash2, Info } from 'lucide-react';
import api from '../services/api';
import { DIRECTIONS } from '../constants/directions';

interface AgentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAgent?: any;
}

interface HistoriqueConge {
  annee: number;
  jours_pris: number;
  type_conge: string;
  observations: string;
}

export function AgentForm({ isOpen, onClose, onSuccess, editAgent }: AgentFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);

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
    jours_pris_historique: 0
  });

  const [historiqueConges, setHistoriqueConges] = useState<HistoriqueConge[]>([]);

  useEffect(() => {
    if (editAgent) {
      setFormData({
        matricule: editAgent.matricule || '',
        nom: editAgent.nom || '',
        prenoms: editAgent.prenoms || '',
        sexe: editAgent.sexe || 'M',
        direction: editAgent.direction || DIRECTIONS[0],
        fonction: editAgent.fonction || '',
        telephone: editAgent.telephone || '',
        email: editAgent.email || '',
        date_embauche: editAgent.date_embauche || '',
        jours_pris_historique: editAgent.jours_pris_historique || 0
      });
    }
  }, [editAgent]);

  // Calcul automatique du total des jours historiques
  const totalJoursHistorique = historiqueConges.reduce((sum, h) => sum + h.jours_pris, 0);

  // Calcul des congés acquis
  const calculerCongesAcquis = () => {
    if (!formData.date_embauche) return { annees: 0, acquis: 0 };
    
    const embauche = new Date(formData.date_embauche);
    const today = new Date();
    const annees = Math.floor((today.getTime() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const acquis = annees * 30;
    
    return { annees, acquis };
  };

  const { annees, acquis } = calculerCongesAcquis();
  const soldeCalcule = Math.max(0, acquis - totalJoursHistorique);

  const addHistoriqueConge = () => {
    setHistoriqueConges([...historiqueConges, {
      annee: new Date().getFullYear() - 1,
      jours_pris: 0,
      type_conge: 'Annuel',
      observations: ''
    }]);
  };

  const removeHistoriqueConge = (index: number) => {
    setHistoriqueConges(historiqueConges.filter((_, i) => i !== index));
  };

  const updateHistoriqueConge = (index: number, field: keyof HistoriqueConge, value: any) => {
    const updated = [...historiqueConges];
    updated[index] = { ...updated[index], [field]: value };
    setHistoriqueConges(updated);
  };

  const handleSubmit = async () => {
    if (!formData.matricule || !formData.nom || !formData.prenoms || !formData.date_embauche) {
      toast.error("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }

    setLoading(true);
    try {
      // Créer l'agent
      await api.addAgent({
        ...formData,
        jours_pris_historique: totalJoursHistorique
      });

      toast.success("Agent ajouté avec succès !");
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        matricule: '', nom: '', prenoms: '', sexe: 'M',
        direction: DIRECTIONS[0], fonction: '', telephone: '', email: '',
        date_embauche: '', jours_pris_historique: 0
      });
      setHistoriqueConges([]);
      setStep(1);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              {editAgent ? 'Modifier l\'Agent' : 'Nouvel Agent Municipal'}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              Étape {step} sur 2 - {step === 1 ? 'Informations personnelles' : 'Historique des congés'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-200 dark:bg-slate-800">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                {/* Ligne 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                      <User size={12} /> Matricule *
                    </label>
                    <input
                      type="text"
                      value={formData.matricule}
                      onChange={e => setFormData({ ...formData, matricule: e.target.value.toLowerCase() })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                      placeholder="Ex: ag001"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Genre</label>
                    <select
                      value={formData.sexe}
                      onChange={e => setFormData({ ...formData, sexe: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                      <Calendar size={12} /> Date d'embauche *
                    </label>
                    <input
                      type="date"
                      value={formData.date_embauche}
                      onChange={e => setFormData({ ...formData, date_embauche: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Ligne 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={e => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Prénoms *</label>
                    <input
                      type="text"
                      value={formData.prenoms}
                      onChange={e => setFormData({ ...formData, prenoms: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Direction */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                    <Briefcase size={12} /> Direction *
                  </label>
                  <select
                    value={formData.direction}
                    onChange={e => setFormData({ ...formData, direction: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {DIRECTIONS.map(dir => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>
                </div>

                {/* Ligne 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">Fonction</label>
                    <input
                      type="text"
                      value={formData.fonction}
                      onChange={e => setFormData({ ...formData, fonction: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="Ex: Chef de service"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                      <Phone size={12} /> Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="07 00 00 00 00"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                      <Mail size={12} /> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Aperçu des congés */}
                {formData.date_embauche && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-3">
                      <Info size={16} />
                      Aperçu des droits à congés
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{annees}</p>
                        <p className="text-xs text-slate-500">Années d'ancienneté</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{acquis}</p>
                        <p className="text-xs text-slate-500">Jours acquis (30j/an)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{soldeCalcule - totalJoursHistorique}</p>
                        <p className="text-xs text-slate-500">Solde disponible</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {/* Explication */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <History className="text-amber-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-200">Congés pris avant le système</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Enregistrez ici les congés déjà pris par l'agent depuis son embauche jusqu'à aujourd'hui. 
                        Cela permet de calculer correctement son solde de congés.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Date d'embauche</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {formData.date_embauche ? new Date(formData.date_embauche).toLocaleDateString('fr-FR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Jours acquis</p>
                      <p className="text-lg font-bold text-emerald-600">{acquis} jours</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Ancienneté</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{annees} an(s)</p>
                    </div>
                  </div>
                </div>

                {/* Bouton ajouter */}
                <button
                  type="button"
                  onClick={addHistoriqueConge}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  <Plus size={16} />
                  Ajouter une année de congés passés
                </button>

                {/* Liste des historiques */}
                {historiqueConges.length > 0 && (
                  <div className="space-y-3">
                    {historiqueConges.map((h, index) => (
                      <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            Congés {h.annee}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeHistoriqueConge(index)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Année</label>
                            <input
                              type="number"
                              value={h.annee}
                              onChange={e => updateHistoriqueConge(index, 'annee', parseInt(e.target.value))}
                              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                              min="2000"
                              max={new Date().getFullYear()}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Jours pris</label>
                            <input
                              type="number"
                              value={h.jours_pris}
                              onChange={e => updateHistoriqueConge(index, 'jours_pris', parseInt(e.target.value) || 0)}
                              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                              min="0"
                              max="30"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Type</label>
                            <select
                              value={h.type_conge}
                              onChange={e => updateHistoriqueConge(index, 'type_conge', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                            >
                              <option value="Annuel">Annuel</option>
                              <option value="Maladie">Maladie</option>
                              <option value="Exceptionnel">Exceptionnel</option>
                              <option value="Maternité">Maternité</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs text-slate-500 mb-1 block">Observations</label>
                          <input
                            type="text"
                            value={h.observations}
                            onChange={e => updateHistoriqueConge(index, 'observations', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm"
                            placeholder="Optionnel..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                {totalJoursHistorique > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-orange-800 dark:text-orange-200">Total jours pris (avant système)</span>
                      <span className="text-2xl font-black text-orange-600">{totalJoursHistorique} jours</span>
                    </div>
                  </div>
                )}

                {/* Solde final */}
                <div className="bg-emerald-600 text-white rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-emerald-100 text-sm">Solde de congés disponible</p>
                      <p className="text-xs text-emerald-200">Après prise en compte de l'historique</p>
                    </div>
                    <span className="text-3xl font-black">{Math.max(0, acquis - totalJoursHistorique)} jours</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
            <button
              type="button"
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              {step === 1 ? 'Annuler' : '← Retour'}
            </button>
            
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.matricule || !formData.nom || !formData.prenoms || !formData.date_embauche}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : '✓ Créer l\'Agent'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
