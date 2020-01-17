const fs = require('fs');
const path = require('path');
const dest = path.join(process.env.INIT_CWD, 'flows');
if(process.env.CI) {
  console.log("Skipping postinstall during CI.");
  process.exit(0);
}
console.log("Copy Flow-Templates: PerItemFlow and sample Flow: ExampleParentFlow into flows directory.");
fs.copyFileSync(path.join(__dirname, '..', 'flows', 'PerItemFlow.json'), path.join(dest, 'PerItemFlow.json'));
fs.copyFileSync(path.join(__dirname, '..', 'flows', 'ExampleParentFlow.json'), path.join(dest, 'ExampleParentFlow.json'));
console.log("Files successfully copied.");
console.log("");
console.log("");
console.log("After restarting API-Builder you can open the provided example flows: ");
console.log("PerItemFlow:              http://localhost:8080/console/project/flows/PerItemFlow/edit");
console.log("MainFlow calling PerItem: http://localhost:8080/console/project/flows/ExampleParentFlow/edit");
console.log("");
console.log("");
