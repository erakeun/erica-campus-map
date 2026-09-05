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
  '\nglobalThis.buildingData = BUILDINGS; globalThis.facilityData = FACILITIES; globalThis.categoryData = FACILITY_CATEGORIES; globalThis.mapFeatureData = MAP_FEATURES;',
  context
);
const {
  buildingData,
  facilityData,
  categoryData,
  mapFeatureData,
  groupFacilitiesByBuilding: buildings,
  groupFacilitiesByFloor: floors
} = context;

assert.equal(buildingData.length, 52);
assert.equal(facilityData.length, 54);
assert.equal(mapFeatureData.length, 21);
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
assert.equal(facilityData.filter(f => f.category === 'restaurant' && f.url?.includes('erica-today-menu/?restaurant=')).length, 5);
assert.equal(mapFeatureData.filter(f => f.category === 'smoking').length, 20);
assert.equal(mapFeatureData.filter(f => f.category === 'innovation' && f.kind === 'polygon').length, 1);
for (const feature of mapFeatureData) {
  assert.ok(categoryData[feature.category], `${feature.id} must reference an existing category`);
  for (const suffix of ['Ko','En','Zh']) assert.ok(feature[`name${suffix}`], `${feature.id} must include name${suffix}`);
}
for (const key of ['support','convenience','restaurant']) assert.match(categoryData[key].icon, /^<svg/);
for (const query of ['복사','복사기','출력','프린터','인쇄']) assert.ok(categoryData.copy.aliasesKo.includes(query));

assert.equal(buildingData.find(b => b.id === '404').urlKo, 'https://blog.naver.com/hyerica4473/223820883613');
assert.equal(buildingData.find(b => b.id === 'KTC').urlKo, '');
assert.equal(buildingData.find(b => b.id === 'KAKAO').urlKo, 'https://blog.naver.com/hyerica4473/223938119953');
assert.deepEqual(
  [buildingData.find(b => b.id === 'KAKAO').x, buildingData.find(b => b.id === 'KTC').x],
  [70.3, 78.7]
);
assert.equal(buildingData.find(b => b.id === 'AGORA').y, 46.8);
assert.equal(buildingData.find(b => b.id === 'HG').urlKo, 'https://blog.naver.com/hyerica4473/223449382969');
for (const suffix of ['Ko','En','Zh']) assert.ok(buildingData.find(b => b.id === 'HG')[`name${suffix}`]);
assert.match(html, /@media \(max-width:900px\)[\s\S]*?\.map-stage\{width:100%;min-width:100%\}/);
assert.match(html, /else if\(identifiable\)[\s\S]*?openPlaceInfo\(b\)/);
assert.deepEqual(Array.from(buildingData.find(b => b.id === 'AGORA').links, link => link.url), [
  'https://blog.naver.com/hyerica4473/224221136802',
  'https://blog.naver.com/hyerica4473/224222000345'
]);
assert.equal(floors([{floorEn:'B2'},{floorEn:'1F'},{floorEn:'B1'},{floorEn:'3F'},{}]).map(([k])=>k).join(','),'3F,1F,B1,B2,');
assert.equal(buildings([]).size, 0);
assert.equal(floors([]).length, 0);
console.log('PASS: script syntax, buildings/facilities/map features, requested links/categories, grouping, and floor order');
