const fs = require('fs');

const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Sidebar Active Item
content = content.replace(/bg-emerald-50 dark:bg-emerald-500\/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm border border-emerald-100 dark:border-emerald-500\/20/g, 'bg-gradient-to-r from-orange-50 to-white dark:from-orange-500/10 dark:to-transparent text-orange-700 dark:text-orange-400 font-bold shadow-sm border border-orange-200/50 dark:border-orange-500/20');
content = content.replace(/className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"/g, 'className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-emerald-500"');

// Topbar Icon
content = content.replace(/from-emerald-500 to-teal-600/g, 'from-orange-500 via-white to-emerald-600');
content = content.replace(/from-emerald-600 to-teal-600/g, 'from-orange-500 via-white to-emerald-600');
content = content.replace(/bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300\\n                Mairie de Yopougon/g, 'bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-emerald-600 dark:from-orange-400 dark:to-emerald-400\\n                Mairie de Yopougon');

// Buttons globally
content = content.replace(/bg-emerald-600 hover:bg-emerald-500/g, 'bg-orange-600 hover:bg-orange-500');
content = content.replace(/bg-emerald-600 hover:bg-emerald-700/g, 'bg-orange-600 hover:bg-orange-700');
content = content.replace(/shadow-emerald-600\/20/g, 'shadow-orange-600/20');

// Hover effects text
content = content.replace(/group-hover:text-emerald-600/g, 'group-hover:text-orange-600');
content = content.replace(/dark:group-hover:text-emerald-400/g, 'dark:group-hover:text-orange-400');

// Dashboard Stat cards (the very first one)
content = content.replace(/form-emerald-500 to-teal-500/g, 'from-orange-500 to-amber-500');
content = content.replace(/bg-gradient-to-br from-emerald-500 to-teal-500/g, 'bg-gradient-to-br from-orange-500 to-emerald-500');

// Specific backgrounds
content = content.replace(/bg-emerald-50 border-emerald-500 text-emerald-700/g, 'bg-orange-50 border-orange-500 text-orange-700');

fs.writeFileSync(file, content);
console.log('Theme replacement complete.');
