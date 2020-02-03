const path = require('path');
const fs = require('fs');

if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}

fs.unlinkSync(path.join(process.env.INIT_CWD, 'swagger', 'syncplicity-us-swagger.json'));
fs.unlinkSync(path.join(process.env.INIT_CWD, 'swagger', 'syncplicity-us-swagger.png'));
