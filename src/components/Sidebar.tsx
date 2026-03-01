import { NavLink } from "react-router-dom";

export function Sidebar() {
    const getLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${isActive
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold"
            : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        }`;

    return (
        <aside className="w-full lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            <NavLink to="/" end className={getLinkClasses}>
                <span className="material-symbols-outlined">dashboard</span>
                <p className="text-sm">Tableau de bord</p>
            </NavLink>
            <NavLink to="/employees" className={getLinkClasses}>
                <span className="material-symbols-outlined">badge</span>
                <p className="text-sm">Employés</p>
            </NavLink>
            <NavLink to="/leaves" className={getLinkClasses}>
                <span className="material-symbols-outlined">event_busy</span>
                <p className="text-sm">Congés & Absences</p>
            </NavLink>
            <NavLink to="/documents" className={getLinkClasses}>
                <span className="material-symbols-outlined">description</span>
                <p className="text-sm">Rapports & Documents</p>
            </NavLink>
        </aside>
    );
}
