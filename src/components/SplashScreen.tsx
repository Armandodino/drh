import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'done'>('loading');

    useEffect(() => {
        // Simulation du chargement progressif
        const steps = [
            { target: 30, delay: 200 },
            { target: 60, delay: 500 },
            { target: 85, delay: 900 },
            { target: 100, delay: 1400 },
        ];

        steps.forEach(({ target, delay }) => {
            setTimeout(() => setProgress(target), delay);
        });

        // Transition vers "done" puis disparition
        setTimeout(() => setPhase('done'), 1800);
        setTimeout(() => onComplete(), 2400);
    }, [onComplete]);

    const checks = [
        { label: 'Connexion à la base de données', done: progress >= 30 },
        { label: 'Chargement des données RH', done: progress >= 60 },
        { label: 'Initialisation du tableau de bord', done: progress >= 85 },
        { label: 'Prêt', done: progress >= 100 },
    ];

    return (
        <AnimatePresence>
            {phase !== 'done' ? (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Image de fond */}
                    <img
                        src="/mairie_yopougon.jpg"
                        alt="Mairie"
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                    {/* Overlay sombre */}
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />

                    {/* Particules animées */}
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 6 + 2,
                                height: Math.random() * 6 + 2,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: i % 2 === 0 ? '#f97316' : '#10b981',
                                opacity: 0.4,
                            }}
                            animate={{
                                y: [0, -40, 0],
                                opacity: [0.2, 0.6, 0.2],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}

                    {/* Contenu principal */}
                    <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm w-full">

                        {/* Logo animé */}
                        <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                            className="mb-8 relative"
                        >
                            {/* Anneau rotatif externe */}
                            <motion.div
                                className="absolute -inset-4 rounded-full border-2 border-transparent"
                                style={{ borderTopColor: '#f97316', borderRightColor: '#10b981' }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                            {/* Anneau rotatif interne (inverse) */}
                            <motion.div
                                className="absolute -inset-2 rounded-full border border-transparent"
                                style={{ borderBottomColor: '#f97316', borderLeftColor: '#10b981', opacity: 0.5 }}
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />

                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/40">
                                <span className="material-symbols-outlined text-white text-4xl">shield_person</span>
                            </div>
                        </motion.div>

                        {/* Titre */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                                DRH<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-emerald-400">·YOP</span>
                            </h1>
                            <p className="text-slate-400 text-xs uppercase tracking-[0.3em] font-bold">
                                Mairie de Yopougon
                            </p>
                        </motion.div>

                        {/* Barre de progression */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full mt-12 space-y-4"
                        >
                            {/* Checks */}
                            <div className="space-y-2 text-left mb-5">
                                {checks.map((check, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: check.done ? 1 : 0.3, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center gap-2.5 text-xs"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: check.done ? 1 : 0 }}
                                            className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-white text-[10px]">check</span>
                                        </motion.div>
                                        {!check.done && (
                                            <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                                        )}
                                        <span className={check.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                                            {check.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Barre */}
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <span>Chargement du système</span>
                                <span>{progress}%</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bandeau CI en bas */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white/50 to-emerald-500" />
                </motion.div>
            ) : (
                // Phase "done" — flash blanc avant transition
                <motion.div
                    key="flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] bg-white pointer-events-none"
                />
            )}
        </AnimatePresence>
    );
};
