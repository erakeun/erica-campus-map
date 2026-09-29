const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const definitions = html.slice(html.indexOf('const BUILDINGS ='), html.indexOf('const SETTINGS ='));
const source = html.slice(html.indexOf('const linkedBuilding ='), html.lastIndexOf('</script>'));

test('registered building deep links call the existing search exactly once', () => {
  const data = vm.createContext({});
  vm.runInContext(definitions + '\nglobalThis.buildings = BUILDINGS;', data);
  for (const building of data.buildings) {
    const calls = [];
    const context = vm.createContext({ BUILDINGS: data.buildings, params: new URLSearchParams({building:building.id,lang:'en'}), searchInput:{value:''}, clearBtn:{style:{}}, searchBuildings:value=>calls.push(value) });
    vm.runInContext(source, context);
    assert.equal(context.searchInput.value, building.id);
    assert.equal(context.clearBtn.style.display, 'block');
    assert.deepEqual(calls, [true]);
    assert.equal(context.params.get('lang'), 'en');
  }
});

test('missing and unknown IDs preserve the initial map without searching', () => {
  for (const query of ['', 'building=', 'building=__proto__', 'building=%3Cscript%3E', 'building=not-a-building', 'building=101%26applicant%3Dprivate']) {
    const calls = [];
    const context = vm.createContext({ BUILDINGS:[{id:'101'}], params:new URLSearchParams(query), searchInput:{value:''}, clearBtn:{style:{}}, searchBuildings:value=>calls.push(value) });
    vm.runInContext(source, context);
    assert.equal(context.searchInput.value, '');
    assert.equal(context.clearBtn.style.display, undefined);
    assert.deepEqual(calls, []);
  }
});
