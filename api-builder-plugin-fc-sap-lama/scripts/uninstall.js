const path = require('path');
const fs = require('fs');

if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}

fs.unlinkSync(path.join(process.env.INIT_CWD, 'swagger', 'sap-lama-api.json'));
fs.unlinkSync(path.join(process.env.INIT_CWD, 'swagger', 'sap-lama-api.png'));
