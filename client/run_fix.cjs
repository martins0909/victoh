const fs = require('fs');

const file = 'snippet_hero_2.txt';
let c = fs.readFileSync(file, 'utf16le');

const target = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let currentTarget = fs.readFileSync(target, 'utf8');

const navStart = c.indexOf('<Navbar />');
if (navStart === -1) {
    console.error('Cannot find Nav in snippet');
    process.exit(1);
}

const EndIdx = c.indexOf('</section>');
let heroBlock = c.substring(navStart - 20, EndIdx + 10);

const figStart = heroBlock.indexOf('<figure');
const figEnd = heroBlock.indexOf('</figure>') + 9;

if (figStart !== -1) {
    heroBlock = heroBlock.substring(0, figStart) + heroBlock.substring(figEnd);
}

heroBlock = heroBlock.replace(
    '<div className=\"grid lg:grid-cols-2 gap-12 lg:gap-20 items-center\">',
    '<div className=\"flex flex-col items-center justify-center w-full max-w-4xl mx-auto\">'
);

heroBlock = heroBlock.replace(
    'space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 order-1 w-full max-w-2xl mx-auto lg:mx-0 text-center lg:text-left',
    'space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full mx-auto text-center'
);

heroBlock = heroBlock.replaceAll('justify-center lg:justify-start', 'justify-center');
heroBlock = heroBlock.replaceAll('text-center lg:text-left', 'text-center');

heroBlock = heroBlock.replace(
    'mx-auto lg:mx-0 overflow-hidden w-full sm:w-auto relative group',
    'mx-auto overflow-hidden w-full sm:w-auto relative group'
);


// Find where to replace in target
let replaceStart = currentTarget.indexOf('{/*  Navbar */}');
if (replaceStart === -1) {
   replaceStart = currentTarget.indexOf('{/*');
}
const replaceEnd = currentTarget.indexOf('</section>');

if (replaceStart !== -1 && replaceEnd !== -1) {
    let finalOut = currentTarget.substring(0, replaceStart) + 
                   '{/*  Navbar */}\n' + heroBlock + '\n\n' + 
                   currentTarget.substring(replaceEnd + 10);
                   
    fs.writeFileSync(target, finalOut);
    console.log('Successfully fully restored and patched! File length: ' + finalOut.length);
} else {
    console.log('Replace targets not found: start=' + replaceStart + ' end=' + replaceEnd);
}
