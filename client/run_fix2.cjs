const fs = require('fs');
const target = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let c = fs.readFileSync(target, 'utf8');
c = c.replace(' Navbar */}', '{/*  Navbar */}');
fs.writeFileSync(target, c);
console.log('Fixed Mojibake from previous tool replace');
