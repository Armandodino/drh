import { NavLink } from "react-router-dom";
import { Bell, CalendarCheck } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export function Sidebar() {
    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        const fetchNotifCount = async () => {
            try {
                const result = await api.getNotificationsCount();
                setNotifCount(result.count || 0);
            } catch (err) {
                console.error(err);
            }
        };

        fetchNotifCount();
        // Rafraîchir toutes les 2 minutes
        const interval = setInterval(fetchNotifCount, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold"
            : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        }`;

    return (
        <aside className="w-full lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
            <NavLink to="/" end className={getLinkClasses}>
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm">Tableau de bord</p>
            </NavLink>
            
            <NavLink to="/notifications" className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold"
                    : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
            }>
                <Bell size={20} />
                <p className="text-sm">Notifications</p>
                {notifCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {notifCount}
                    </span>
                )}
            </NavLink>

            <NavLink to="/employees" className={getLinkClasses}>
                <span className="material-symbols-outlined">badge</span>
                <p className="text-sm">Employés</p>
            </NavLink>

            <NavLink to="/leaves" className={getLinkClasses}>
                <span className="material-symbols-outlined">event_busy</span>
                <p className="text-sm">Congés & Absences</p>
            </NavLink>

            <NavLink to="/choix-conges" className={getLinkClasses}>
                <CalendarCheck size={20} />
                <p className="text-sm">Planification Annuelle</p>
            </NavLink>

            <NavLink to="/documents" className={getLinkClasses}>
                <span className="material-symbols-outlined">description</span>
                <p className="text-sm">Rapports & Documents</p>
            </NavLink>
        </aside>
    );
}
