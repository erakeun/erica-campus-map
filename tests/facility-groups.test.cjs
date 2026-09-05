const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const context = vm.createContext({});
vm.runInContext(script.slice(script.indexOf('const FACILITIES ='), script.indexOf('const FACILITIES =') + script.slice(script.indexOf('const FACILITIES =')).indexOf('\n];') + 3) + '\n' + script.slice(script.indexOf('function groupFacilitiesByBuilding'), script.indexOf('function renderFacilityMarkers')) + '\nglobalThis.data = FACILITIES;', context);
const {data, groupFacilitiesByBuilding: buildings, groupFacilitiesByFloor: floors} = context;
assert.equal(data.length, 41);
const groups = buildings(data);
assert.equal([...groups.values()].flat().length, data.length);
assert.equal(groups.size, new Set(data.map(f => f.buildingId)).size);
assert.equal(groups.get('102').length, 12);
assert.equal(groups.get('103').length, 3);
assert.equal(floors(groups.get('102')).map(([k])=>k).join(','), '3F,2F,1F');
assert.equal(floors(groups.get('103')).map(([k])=>k).join(','), '4F,3F');
for (const category of new Set(data.map(f=>f.category))) {
  const selected = data.filter(f=>f.category===category);
  assert.equal([...buildings(selected).values()].flat().length, selected.length);
}
assert.equal(floors([{floorEn:'B2'},{floorEn:'1F'},{floorEn:'B1'},{floorEn:'3F'},{}]).map(([k])=>k).join(','),'3F,1F,B1,B2,');
assert.equal(buildings([]).size, 0);
assert.equal(floors([]).length, 0);
console.log('PASS: script syntax, all 41 facilities preserved, category filters, building groups, floor order and empty input');
