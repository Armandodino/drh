import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../services/api';
import { exportStatsExcel, exportStatsPDF, exportAgentsExcel, exportCongesExcel } from '../services/export';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#71717a', '#a855f7', '#14b8a6', '#f97316'];

// Helper pour normaliser les statuts
const normalizeStatut = (statut: string) => statut?.toLowerCase().replace('_', ' ').replace('é', 'e');

export function Dashboard() {
    const [stats, setStats] = useState({ total_agents: 0, actifs: 0, urgents: 0, solde_total: 0, en_cours: 0 });
    const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [allAgents, setAllAgents] = useState<any[]>([]);
    const [allConges, setAllConges] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const agentsData = await api.getAgents();
                const congesData = await api.getConges();
                
                // Filtrer les agents (exclure admin/dev)
                const agents = agentsData.filter((a: any) => a.role === 'AGENT');
                setAllAgents(agents);
                setAllConges(congesData);

                // Calculer le solde total
                const soldeTotal = agents.reduce((acc: number, agent: any) => {
                    if (!agent.date_embauche) return acc;
                    const embauche = new Date(agent.date_embauche);
                    const today = new Date();
                    const annees = Math.floor((today.getTime() - embauche.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    const acquis = annees * 30;
                    const pris = congesData
                        .filter((c: any) => c.employe_id === agent.id && normalizeStatut(c.statut).includes('approuve'))
                        .reduce((sum: number, c: any) => sum + (c.nombre_jours || 0), 0);
                    const historique = agent.jours_pris_historique || 0;
                    return acc + Math.max(0, acquis - pris - historique);
                }, 0);

                setStats({
                    total_agents: agents.length,
                    actifs: congesData.filter((c: any) => normalizeStatut(c.statut).includes('approuve')).length,
                    urgents: congesData.filter((c: any) => normalizeStatut(c.statut).includes('attente')).length,
                    en_cours: congesData.filter((c: any) => normalizeStatut(c.statut).includes('cours')).length,
                    solde_total: soldeTotal
                });

                // PieChart: Répartition par Direction
                const directionCounts: Record<string, number> = {};
                agents.forEach((a: any) => {
                    const dir = a.direction || 'Autres';
                    directionCounts[dir] = (directionCounts[dir] || 0) + 1;
                });
                setChartData(Object.entries(directionCounts).map(([name, value]) => ({ name, value })));

                // AreaChart: Tendance des Congés par Type
                const typeCounts: Record<string, number> = {};
                congesData.forEach((c: any) => {
                    const type = c.type?.charAt(0).toUpperCase() + c.type?.slice(1) || 'Annuel';
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
                setTrendData(Object.entries(typeCounts).map(([name, count]) => ({ name, count })));

                // Congés récents avec infos agents
                const enrichedLeaves = congesData.slice(-5).map((conge: any) => {
                    const agent = agentsData.find((a: any) => a.id === conge.employe_id);
                    return { ...conge, agent };
                });
                setRecentLeaves(enrichedLeaves.reverse());

            } catch (err) {
                console.error("Erreur chargement dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusBadge = (statut: string) => {
        const normalized = normalizeStatut(statut);
        if (normalized.includes('attente')) {
            return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-amber-100 text-amber-700">En attente</span>;
        }
        if (normalized.includes('approuve')) {
            return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-emerald-100 text-emerald-700">Approuvé</span>;
        }
        if (normalized.includes('cours')) {
            return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-blue-100 text-blue-700">En cours</span>;
        }
        if (normalized.includes('termine')) {
            return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-700">Terminé</span>;
        }
        if (normalized.includes('annule') || normalized.includes('refuse')) {
            return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-red-100 text-red-700">Annulé</span>;
        }
        return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-600">{statut}</span>;
    };

    return (
        <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Tableau de Bord
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Commune de Yopougon — Direction des Ressources Humaines
                    </p>
                </div>

                {/* Boutons d'Export */}
                {!loading && (
                    <div className="flex flex-wrap gap-2">
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow transition-all">
                                <span className="material-symbols-outlined text-base">table_chart</span>
                                Excel
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 w-52 z-50 hidden group-hover:block">
                                <button onClick={() => exportStatsExcel(allAgents, allConges)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-base text-emerald-600">bar_chart</span>
                                    Rapport complet
                                </button>
                                <button onClick={() => exportAgentsExcel(allAgents)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-base text-blue-500">group</span>
                                    Liste des agents
                                </button>
                                <button onClick={() => exportCongesExcel(allConges, allAgents)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                    <span className="material-symbols-outlined text-base text-orange-500">event_busy</span>
                                    Liste des congés
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => exportStatsPDF(allAgents, allConges)}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow transition-all"
                        >
                            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                            PDF
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12 text-slate-500 font-bold">Chargement des données...</div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">badge</span>
                                </div>
                                <span className="text-emerald-500 text-[10px] font-black tracking-tighter uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 italic">Global</span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Agents</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total_agents}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
                                </div>
                                <span className="text-blue-500 text-[10px] font-black tracking-tighter uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 italic">Approuvés</span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Congés Approuvés</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.actifs}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">pending_actions</span>
                                </div>
                                <span className={`${stats.urgents > 0 ? 'text-red-500 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100'} text-[10px] font-black tracking-tighter uppercase px-2.5 py-1 rounded-full border italic`}>
                                    À Valider
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Demandes en Attente</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.urgents}</h3>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">event_available</span>
                                </div>
                                <span className="text-purple-500 text-[10px] font-black tracking-tighter uppercase bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 italic">Cumul</span>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Solde Global</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.solde_total} <span className="text-xs opacity-50">jours</span></h3>
                        </div>
                    </div>

                    {/* Graphiques */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* AreaChart - Tendance Congés */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-emerald-600">show_chart</span>
                                Tendance des Congés par Type
                            </h4>
                            <div className="h-[280px]">
                                {trendData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">Aucune donnée disponible</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* PieChart - Répartition Directions */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-blue-600">pie_chart</span>
                                Répartition par Direction
                            </h4>
                            <div className="h-[280px]">
                                {chartData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">Aucun agent enregistré</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tableau Demandes Récentes */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Demandes Récentes</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest italic border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-6 py-4">Employé</th>
                                        <th className="px-6 py-4">Type / Motif</th>
                                        <th className="px-6 py-4">Durée</th>
                                        <th className="px-6 py-4 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {recentLeaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                                                Aucun congé récent à afficher
                                            </td>
                                        </tr>
                                    ) : recentLeaves.map((conge) => (
                                        <tr key={conge.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-xs uppercase">
                                                        {conge.agent ? `${conge.agent.nom?.charAt(0)}${conge.agent.prenoms?.charAt(0)}` : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {conge.agent ? `${conge.agent.nom} ${conge.agent.prenoms}` : 'Agent inconnu'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{conge.agent?.direction || conge.direction || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{conge.type || 'Annuel'}</p>
                                                <p className="text-[10px] text-slate-400">{conge.motif || 'Sans motif'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-bold italic uppercase">
                                                {conge.nombre_jours} j
                                                <span className="block text-[10px] font-normal text-slate-400 not-italic normal-case">
                                                    {new Date(conge.date_depart).toLocaleDateString('fr-FR')} → {new Date(conge.date_retour).toLocaleDateString('fr-FR')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {getStatusBadge(conge.statut)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
