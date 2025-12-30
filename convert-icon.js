const fs = require('fs');
const pngToIco = require('png-to-ico');
console.log('pngToIco type:', typeof pngToIco);
console.log('pngToIco:', pngToIco);

pngToIco.default(['icon/calendar_icon.png'])
    .then(buf => {
        fs.writeFileSync('icon/calendar_icon.ico', buf);
        console.log('Successfully created icon/calendar_icon.ico');
    })
    .catch(err => {
        console.error('Error details:', err);
    });
