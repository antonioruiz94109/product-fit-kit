'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const K=require('../core.js'),{validate}=require('../scripts/publish-check.js');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const c=read('categories/shoes-sample/config.json'),data=read('categories/shoes-sample/data.json'),today='2026-11-06';
const fixture=name=>read(`tests/fixtures/${name}.json`);
test('all four configs and shipped data validate',()=>{for(const name of fs.readdirSync(path.join(__dirname,'../categories'))){const config=read(`categories/${name}/config.json`);const file=`categories/${name}/data.json`;const products=fs.existsSync(path.join(__dirname,'..',file))?read(file):[];assert.deepEqual(validate(config,products,today).errors,[]);}});
for(const [name,expected] of [['missing-quote','quote required'],['non-brand-source','allowed domains'],['quote-mismatch','quote does not contain'],['unknown-state','unknown state'],['calculated-no-inputs','original'],['dealer-label','dealer price needs']])test(`rejects ${name}`,()=>assert.ok(validate(c,fixture(name),today).errors.some(e=>e.includes(expected))));
test('rejects six filters',()=>assert.ok(validate(fixture('six-filters'),data,today).errors.some(e=>e.includes('3–5'))));
for(const name of ['stale','conflicting'])test(`${name} warns but passes`,()=>{const r=validate(c,fixture(name),today);assert.deepEqual(r.errors,[]);assert.equal(r.warnings.length,1);});
test('OR within choices, AND across filters',()=>{
 const selection={brand:['Topo Athletic','Nike'],drop:['5']};const found=data.filter(p=>K.matches(p,c,selection));assert.equal(found.length,3);assert.ok(found.every(p=>p.brand==='Topo Athletic'));
 assert.equal(data.filter(p=>K.matches(p,c,{brand:['Topo Athletic','Nike']})).length,5);
 assert.equal(data.filter(p=>K.matches(p,c,{})).length,10);
});
test('missing and differently measured values are excluded, never zero',()=>{
 const p=fixture('measured-differently')[0];assert.equal(K.matches(p,c,{weight:['20']}),false);assert.equal(K.usable(p.fields.weight),false);
 const missing=data.find(p=>p.brand==='Altra');assert.equal(K.matches(missing,c,{drop:['0']}),false);assert.equal(K.matches(missing,c,{}),true);
 assert.equal(K.sortProducts([missing,...data.filter(p=>p!==missing)],c,'weight').at(-1).id,missing.id);
});
test('dealer prices sort after manufacturer prices, despite their amounts',()=>{const dealer=fixture('dealer-label')[0],higher=data.find(p=>p.model==='Vaporfly 4');assert.equal(K.sortProducts([dealer,higher],c,'price')[1],dealer);});
test('shared URL roundtrip and old/unknown parameters',()=>{const s={brand:['Topo Athletic','Nike'],drop:['5'],intended_use:[c.filters[0].values[0]]};assert.deepEqual(K.readSelection('?'+K.writeSelection(s,'weight'),c),s);assert.deepEqual(K.readSelection('?obsolete=1&drop=bad&brand=unknown',c),{});});
test('conversion is recomputed from a verified original and rejects tampering',()=>{
 const p=structuredClone(data.find(p=>p.model==='Vomero 18'));const r=p.fields.weight;r.state='Converted';r.original={value:325,unit:'g'};r.decimals=1;
 assert.deepEqual(validate(c,[p],today).errors,[]);
 r.value=data[0].fields.weight.value;assert.ok(validate(c,[p],today).errors.some(e=>e.includes('recomputed')));
});
test('invalid dates, choice values, unknown keys, domain tricks and missing units fail',()=>{
 for(const mutate of [p=>p.fields.weight.checked='2026-02-30',p=>p.fields.intended_use.value='Invalid test choice',p=>p.fields.extra=p.fields.drop,p=>p.fields.weight.source_url='https://topoathletic.com.example.com/',p=>delete p.fields.weight.unit]){const p=structuredClone(data[0]);mutate(p);assert.ok(validate(c,[p],today).errors.length);}
});
test('calendar age warning boundary',()=>{assert.equal(K.stale('2025-11-06',today),false);assert.equal(K.stale('2025-11-05',today),true);});
test('luggage config has empty data and benchmark excludes incompatible states',()=>{
 const luggage=read('categories/luggage/config.json');assert.deepEqual(read('categories/luggage/data.json'),[]);
 // Real published shoe drop becomes a numeric benchmark input; no invented product specs.
 const p=data[0],f={type:'benchmark',source:'drop',mode:'max',limit:p.fields.drop.value,checked:today};assert.equal(K.record(p,f).value,true);
 for(const state of ['Calculated','Measured differently','Brand estimate','Not published','Conflicting','Not yet verified']){const copy=structuredClone(p);copy.fields.drop.state=state;assert.equal(K.usable(K.record(copy,f)),false);}
});
test('min and range modes use inclusive minima and exclusive band maxima',()=>{
 const config=structuredClone(c),f=config.filters.find(f=>f.key==='drop');
 f.mode='min';assert.equal(data.filter(p=>K.matches(p,config,{drop:['10']})).length,2);
 f.mode='range';f.bands=[{id:'low',label:'Below 5',min:0,max:5},{id:'mid',label:'5 to below 10',min:5,max:10}];
 assert.equal(data.filter(p=>K.matches(p,config,{drop:['low']})).length,1);
 assert.equal(data.filter(p=>K.matches(p,config,{drop:['low','mid']})).length,7);
});
test('malformed originals produce clear errors rather than throwing',()=>{
 for(const original of ['invalid',null,[null]]){const p=structuredClone(data[0]);p.fields.weight.state='Calculated';p.fields.weight.original=original;assert.ok(validate(c,[p],today).errors.some(e=>e.includes('original')));}
});
