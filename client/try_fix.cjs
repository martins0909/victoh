const fs = require('fs');
const file = 'C:/Users/hp/Desktop/victohs/client/src/pages/Index.tsx';
let txt = fs.readFileSync(file, 'utf-8');

// I am noticing from the logs that the user's system threw a specific character parsing error in the earlier build, most likely because my multiline regex left some malformed invisible characters or missed a \</div>\.
txt = txt.replace('            {/* ƒû Hero Image & Showcase */}\r\n\r\n\r\n          </div>', '          </div>');

fs.writeFileSync(file, txt);
console.log('Fixed syntax?');
