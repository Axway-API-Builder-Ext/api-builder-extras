const fs = require('fs');
const path = require('path');
const dest = path.join(process.env.INIT_CWD, 'swagger');
if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}
console.log("Copy syncplicity-us-swagger.json and syncplicity-us-swagger.png to API-Builder swagger folder.");
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'syncplicity-us-swagger.json'), path.join(dest, 'syncplicity-us-swagger.json'));
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'syncplicity-us-swagger.png'), path.join(dest, 'syncplicity-us-swagger.png'));
console.log("Files successfully copied.");
