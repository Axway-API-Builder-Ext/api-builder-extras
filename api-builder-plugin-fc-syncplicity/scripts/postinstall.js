const fs = require('fs');
const path = require('path');
const dest = path.join(process.env.INIT_CWD, 'swagger');
if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}
console.log("Copy syncplicity.json and syncplicity.png to API-Builder swagger folder.");
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'syncplicity.json'), path.join(dest, 'syncplicity.json'));
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'syncplicity.png'), path.join(dest, 'syncplicity.png'));
console.log("Files successfully copied.");
