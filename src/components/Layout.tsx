import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <Header />
                <div className="flex flex-1 flex-col lg:flex-row">
                    <Sidebar />
                    <main className="flex-1 flex flex-col p-6 lg:p-8 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
