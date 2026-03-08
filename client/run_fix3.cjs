const fs = require('fs');
const target = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let c = fs.readFileSync(target, 'utf8');

// Strip out that whole mess of navbar comments
let start = c.indexOf('<main');
let navIndex = c.indexOf('<Navbar />');

if (start !== -1 && navIndex !== -1) {
    let top = c.substring(0, start);
    let mainDef = '<main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">\n      {/*  Navbar */}\n      ';
    let afterNav = c.substring(navIndex);
    fs.writeFileSync(target, top + mainDef + afterNav);
    console.log('Fixed wrapper syntax cleanly');
}
