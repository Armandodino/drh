import { useState, useEffect } from 'react';
import api from '../services/api';
import { generateArretService, generateRepriseService } from '../services/pdf';

export function Documents() {
    const [conges, setConges] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const [agentsData, congesData] = await Promise.all([
                    api.getAgents(),
                    api.getConges()
                ]);
                setAgents(agentsData);
                const finishedConges = congesData.filter((c: any) => c.statut === 'Approuvé' || c.statut === 'Terminé');
                setConges(finishedConges);
            } catch (err) {
                console.error("Erreur de récupération des données pour documents : ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const enrichedDocs = conges.map((conge: any) => {
        const agent = agents.find((a: any) => a.id === conge.employe_id);
        return {
            ...conge,
            agent: agent, // Add the full agent object for pdf.js to use
            agentName: agent ? `${agent.nom} ${agent.prenoms}` : 'Inconnu',
            agentDirection: agent ? agent.direction : 'N/A'
        };
    }).filter((doc: any) => doc.agentName.toLowerCase().includes(search.toLowerCase()) || doc.type.toLowerCase().includes(search.toLowerCase()));

    const handlePrint = (doc: any, doctype: string) => {
        if (doctype === 'arret') {
            generateArretService(doc);
        } else {
            generateRepriseService(doc);
        }
    }

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        Gestion des Notes de Service
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Édition et suivi des arrêts et reprises de service de la commune.
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[240px]">
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-slate-400">
                            person_search
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Filtrer par nom d'employé ou type..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="w-full md:w-auto flex gap-2">
                    <select className="bg-slate-50 dark:bg-slate-800 border-none border-slate-200 dark:border-slate-700 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option>Tous les types</option>
                        <option>Arrêt de service</option>
                        <option>Reprise de service</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                            Documents d'Arrêt / Reprise
                        </h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 dark:border-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full">
                            {enrichedDocs.length} documents
                        </span>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-48 text-slate-500">Chargement des documents...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Période</th>
                                        <th className="px-6 py-3">Employé</th>
                                        <th className="px-6 py-3">Type / Motif</th>
                                        <th className="px-6 py-3">Statut Doc</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {enrichedDocs.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-slate-500">Aucun document pertinent trouvé.</td></tr>
                                    ) : enrichedDocs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                    Du {doc.date_depart}
                                                </div>
                                                <div className="text-xs text-slate-500">Au {doc.date_retour || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs uppercase text-slate-600">
                                                        {doc.agentName.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">
                                                            {doc.agentName}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {doc.agentDirection}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {doc.type}
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{doc.motif || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex">
                                                    <span className="size-1.5 rounded-full bg-emerald-600"></span>
                                                    {doc.statut}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handlePrint(doc, 'arret')} className="text-orange-600 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs">
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                        Arrêt
                                                    </button>
                                                    <button onClick={() => handlePrint(doc, 'reprise')} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs">
                                                        <span className="material-symbols-outlined text-sm">print</span>
                                                        Reprise
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
            </div>
        </>
    );
}
