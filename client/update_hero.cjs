const fs = require('fs');
const path = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let content = fs.readFileSync(path, 'utf8');

const figStart = content.indexOf('{/*  Hero Image & Showcase */}');
const figEnd = content.indexOf('</figure>') + 9;

if (figStart !== -1 && figEnd > 9) {
    const figBlock = content.slice(figStart, figEnd);
    content = content.replace(figBlock, '');
}

content = content.replace(
    '<div className=\"grid lg:grid-cols-2 gap-12 lg:gap-20 items-center\">',
    '<div className=\"flex flex-col items-center justify-center w-full max-w-4xl mx-auto\">'
);

content = content.replace(
    'space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 order-1 w-full max-w-2xl mx-auto lg:mx-0 text-center lg:text-left',
    'space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full mx-auto text-center'
);

content = content.replace(
    'justify-center lg:justify-start',
    'justify-center'
);

// Extra one in the stats
content = content.replaceAll(
    'text-center lg:text-left',
    'text-center'
);

// One more check in inline-flex
content = content.replace(
    'inline-flex items-center gap-3 p-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm mx-auto lg:mx-0 overflow-hidden w-full sm:w-auto relative group',
    'inline-flex items-center gap-3 p-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm mx-auto overflow-hidden w-full sm:w-auto relative group'
);

fs.writeFileSync(path, content);
console.log('Done mapping hero section.');
