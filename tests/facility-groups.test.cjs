const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const context = vm.createContext({});
vm.runInContext(
  script.slice(script.indexOf('const BUILDINGS ='), script.indexOf('const SETTINGS =')) + '\n' +
  script.slice(script.indexOf('function groupFacilitiesByBuilding'), script.indexOf('function renderFacilityMarkers')) +
  '\nglobalThis.buildingData = BUILDINGS; globalThis.facilityData = FACILITIES; globalThis.categoryData = FACILITY_CATEGORIES;',
  context
);
const {
  buildingData,
  facilityData,
  categoryData,
  groupFacilitiesByBuilding: buildings,
  groupFacilitiesByFloor: floors
} = context;

assert.equal(buildingData.length, 51);
assert.equal(facilityData.length, 54);
assert.equal(new Set(buildingData.map(b => b.id)).size, buildingData.length, 'building IDs must be unique');
assert.equal(new Set(facilityData.map(f => f.id)).size, facilityData.length, 'facility IDs must be unique');
for (const facility of facilityData) {
  assert.ok(buildingData.some(building => building.id === facility.buildingId), `${facility.id} must reference an existing building`);
  assert.ok(categoryData[facility.category], `${facility.id} must reference an existing category`);
}

const groups = buildings(facilityData);
assert.equal([...groups.values()].flat().length, facilityData.length);
assert.equal(groups.size, new Set(facilityData.map(f => f.buildingId)).size);
assert.equal(groups.get('102').length, 14);
assert.equal(groups.get('103').length, 6);
assert.equal(groups.get('307').length, 5);
assert.equal(floors(groups.get('102')).map(([k])=>k).join(','), '3F,2F,1F');
assert.equal(floors(groups.get('103')).map(([k])=>k).join(','), '4F,3F,2F,1F');
for (const category of new Set(facilityData.map(f=>f.category))) {
  const selected = facilityData.filter(f=>f.category===category);
  assert.equal([...buildings(selected).values()].flat().length, selected.length);
}

assert.equal(facilityData.find(f => f.id === 'support-admissions').nameKo, '입학처 입학팀');
assert.equal(facilityData.find(f => f.id === 'admin-convergence-industry-graduate-rc').category, 'admin');
assert.equal(facilityData.find(f => f.id === 'support-erica-ic-pbl-teaching-learning').floorKo, '지하 1층 B109호');
assert.equal(facilityData.filter(f => f.category === 'finance').length, 2);
assert.equal(facilityData.filter(f => f.category === 'copy').length, 3);
assert.equal(facilityData.find(f => f.id === 'store-residential-college-7eleven').buildingId, '504');
for (const key of ['support','convenience','restaurant']) assert.match(categoryData[key].icon, /^<svg/);
for (const query of ['복사','복사기','출력','프린터','인쇄']) assert.ok(categoryData.copy.aliasesKo.includes(query));

assert.equal(buildingData.find(b => b.id === '404').urlKo, 'https://blog.naver.com/hyerica4473/223820883613');
assert.equal(buildingData.find(b => b.id === 'KTC').urlKo, 'https://blog.naver.com/hyerica4473/223938119953');
assert.equal(buildingData.find(b => b.id === 'KAKAO').urlKo, '');
assert.deepEqual(Array.from(buildingData.find(b => b.id === 'AGORA').links, link => link.url), [
  'https://blog.naver.com/hyerica4473/224221136802',
  'https://blog.naver.com/hyerica4473/224222000345'
]);
assert.equal(floors([{floorEn:'B2'},{floorEn:'1F'},{floorEn:'B1'},{floorEn:'3F'},{}]).map(([k])=>k).join(','),'3F,1F,B1,B2,');
assert.equal(buildings([]).size, 0);
assert.equal(floors([]).length, 0);
console.log('PASS: script syntax, 51 buildings, 54 facilities, requested links/categories, grouping, and floor order');
