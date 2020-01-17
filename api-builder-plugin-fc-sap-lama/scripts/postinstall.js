const fs = require('fs');
const path = require('path');
const dest = path.join(process.env.INIT_CWD, 'swagger');
if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}
console.log("Copy sap-lama-api.json and sap-lama-api.png to API-Builder swagger folder.");
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'sap-lama-api.json'), path.join(dest, 'sap-lama-api.json'));
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'sap-lama-api.png'), path.join(dest, 'sap-lama-api.png'));
console.log("Files successfully copied.");
