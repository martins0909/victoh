const fs = require('fs');
const file = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let txt = fs.readFileSync(file, 'utf-8');

// Replace dark text on pill marquee badge texts
txt = txt.replace(/text-gray-800 dark:text-gray-200/g, 'text-gray-200');

// Replace main headline text to be forced white instead of text-gray-900
txt = txt.replace('text-gray-900 dark:text-white leading-[1.1]', 'text-white leading-[1.1]');

// Replace subtitle text to be lighter gray
txt = txt.replace('text-gray-600 dark:text-gray-300 leading-relaxed', 'text-gray-300 leading-relaxed text-shadow-sm');

// Replace strong text in subtitle to be white
txt = txt.replace('font-semibold text-gray-900 dark:text-white', 'font-semibold text-white drop-shadow-md');

// Replace pill marquee background to be forced dark glassmorphism
txt = txt.replace('bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50', 'bg-black/40 backdrop-blur-md border border-white/10');

// Replace Trust indicators texts
txt = txt.replaceAll('text-gray-900 dark:text-white drop-shadow-sm', 'text-white drop-shadow-sm');

// Replace "Learn More" button styling so it's readable on dark background
txt = txt.replace('border-gray-200 dark:border-gray-700 hover:border-rose-400 dark:hover:border-rose-400/80 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100', 'border-white/20 hover:border-rose-400 hover:bg-white/10 text-white backdrop-blur-sm');

fs.writeFileSync(file, txt);
console.log('Done applying 2026 dark mode text styling for hero');
