import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

interface HeaderProps {
    onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
    const userString = localStorage.getItem('user_data');
    const user = userString ? JSON.parse(userString) : null;
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('drh_token');
        localStorage.removeItem('user_data');
        if (onLogout) onLogout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-10 py-3 sticky top-0 z-40">
            <Link to="/" className="flex items-center gap-4 text-emerald-600">
                <div className="size-8 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-emerald-600">account_balance</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Mairie de Yopougon</h2>
            </Link>
            <div className="flex flex-1 justify-end gap-4 items-center">
                <div className="flex gap-2">
                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-500/10 hover:text-orange-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-500/10 hover:text-orange-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                    </button>
                </div>
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.nom || 'Admin RH'}</p>
                        <p className="text-xs text-slate-500">{user?.role === 'ADMIN_DRH' ? 'Superviseur' : 'Agent'}</p>
                    </div>
                    <div
                        className="bg-emerald-500 text-white font-bold flex items-center justify-center aspect-square rounded-full size-10 border-2 border-emerald-500/20 cursor-pointer shadow-md"
                    >
                        {user?.nom?.charAt(0) || 'A'}
                    </div>
                    <button onClick={handleLogout} className="ml-2 text-red-500 hover:text-red-700 transition-colors" title="Se déconnecter">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
