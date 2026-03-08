const fs = require('fs');
const path = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let currentTarget = fs.readFileSync(path, 'utf8');

// I will just look for the first part of the section and the About Section.
const aboutIdx = currentTarget.indexOf('{/* ? About Section */}');
const navIdx = currentTarget.indexOf('{/*  Navbar */}');

if (aboutIdx > -1 && navIdx > -1) {
    console.log('Found boundaries!');
} else {
    console.log('could not find boundaries', {aboutIdx, navIdx});
}
