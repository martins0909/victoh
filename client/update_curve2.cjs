const fs = require('fs');
const path = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let txt = fs.readFileSync(path, 'utf8');

const regex = /id="home"[\s\S]*?aria-label="Welcome to Victohs"/;
const replacement = id="home"\n        className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-28 pb-32 lg:pb-40 px-4 md:px-8 overflow-hidden transition-colors duration-300"\n        aria-label="Welcome to Victohs"\n        style={{ clipPath: "ellipse(140% 100% at 50% 0%)" }};

if (regex.test(txt)) {
    txt = txt.replace(regex, replacement);
    fs.writeFileSync(path, txt);
    console.log('Successfully applied curved bottom!');
} else {
    console.log('Could not find the target section to replace.');
}
