const fs = require('fs');
const path = require('path');
const dest = path.join(process.env.INIT_CWD, 'swagger');
if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}
console.log("Copy jira-cp-connector.json and jira-cp-connector.png to API-Builder swagger folder.");
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'jira-cp-connector.json'), path.join(dest, 'jira-cp-connector.json'));
fs.copyFileSync(path.join(__dirname, '..', 'swagger', 'jira-cp-connector.png'), path.join(dest, 'jira-cp-connector.png'));
console.log("Files successfully copied.");
