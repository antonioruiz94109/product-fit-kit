'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const K=require('../core.js'),{validate}=require('../scripts/publish-check.js');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const c=read('categories/shoes-sample/config.json'),data=read('categories/shoes-sample/data.json'),today=new Date().toISOString().slice(0,10);
const fixture=name=>read(`tests/fixtures/${name}.json`);
test('all four configs and shipped data validate',()=>{for(const name of fs.readdirSync(path.join(__dirname,'../categories'))){const config=read(`categories/${name}/config.json`);const file=`categories/${name}/data.json`;const products=fs.existsSync(path.join(__dirname,'..',file))?read(file):[];assert.deepEqual(validate(config,products,today).errors,[]);}});
for(const [name,expected] of [['missing-quote','quote required'],['non-brand-source','allowed domains'],['quote-mismatch','quote does not contain'],['unknown-state','unknown state'],['calculated-no-inputs','original'],['dealer-label','dealer price needs']])test(`rejects ${name}`,()=>assert.ok(validate(c,fixture(name),today).errors.some(e=>e.includes(expected))));
test('rejects six filters',()=>assert.ok(validate(fixture('six-filters'),data,today).errors.some(e=>e.includes('3–5'))));
for(const name of ['stale','conflicting'])test(`${name} warns but passes`,()=>{const r=validate(c,fixture(name),'2026-11-07');assert.deepEqual(r.errors,[]);assert.equal(r.warnings.length,1);});
test('OR within choices, AND across filters',()=>{
 const selection={brand:['Topo Athletic','Nike'],drop:['5']};const found=data.filter(p=>K.matches(p,c,selection));assert.equal(found.length,4);assert.ok(found.every(p=>p.brand==='Topo Athletic'));
 assert.equal(data.filter(p=>K.matches(p,c,{brand:['Topo Athletic','Nike']})).length,6);
 assert.equal(data.filter(p=>K.matches(p,c,{})).length,10);
});
test('missing and differently measured values are excluded, never zero',()=>{
 const p=fixture('measured-differently')[0];assert.equal(K.matches(p,c,{weight:['20']}),false);assert.equal(K.usable(p.fields.weight),false);
 const missing=structuredClone(data[0]);missing.fields.weight.state='Not yet verified';assert.equal(K.matches(missing,c,{weight:['20']}),false);assert.equal(K.matches(missing,c,{}),true);
 assert.equal(K.sortProducts([missing,...data.filter(p=>p.id!==missing.id)],c,'weight').at(-1).id,missing.id);
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
test('calendar age warning boundary',()=>{assert.equal(K.stale('2025-11-07','2026-11-07'),false);assert.equal(K.stale('2025-11-06','2026-11-07'),true);});
test('empty category validates and benchmark excludes incompatible states',()=>{
 const luggage=read('categories/luggage/config.json');assert.deepEqual(validate(luggage,[],today).errors,[]);
 // Real published shoe drop becomes a numeric benchmark input; no invented product specs.
 const p=data[0],f={type:'benchmark',source:'drop',mode:'max',limit:p.fields.drop.value,checked:today};assert.equal(K.record(p,f).value,true);
 for(const state of ['Calculated','Measured differently','Brand estimate','Not published','Conflicting','Not yet verified']){const copy=structuredClone(p);copy.fields.drop.state=state;assert.equal(K.usable(K.record(copy,f)),false);}
});
test('min and range modes use inclusive minima and exclusive band maxima',()=>{
 const config=structuredClone(c),f=config.filters.find(f=>f.key==='drop');
 f.mode='min';assert.equal(data.filter(p=>K.matches(p,config,{drop:['10']})).length,2);
 f.mode='range';f.bands=[{id:'low',label:'Below 5',min:0,max:5},{id:'mid',label:'5 to below 10',min:5,max:10}];
 assert.equal(data.filter(p=>K.matches(p,config,{drop:['low']})).length,1);
 assert.equal(data.filter(p=>K.matches(p,config,{drop:['low','mid']})).length,8);
});
test('malformed originals produce clear errors rather than throwing',()=>{
 for(const original of ['invalid',null,[null]]){const p=structuredClone(data[0]);p.fields.weight.state='Calculated';p.fields.weight.original=original;assert.ok(validate(c,[p],today).errors.some(e=>e.includes('original')));}
});

test('editorial groups preserve raw evidence and support multi-group OR',()=>{
 const rebel=data.find(p=>p.model==='FuelCell Rebel v5');
 assert.equal(rebel.fields.intended_use.value,'Everyday Running, Quick Runs');
 assert.equal(K.matches(rebel,c,{intended_use:['Road daily']}),true);
 assert.equal(K.matches(rebel,c,{intended_use:['Road fast']}),true);
 assert.equal(K.matches(rebel,c,{intended_use:['Trail']}),false);
 assert.equal(K.matches(rebel,c,{intended_use:['Trail','Road fast']}),true);
 assert.equal(K.matches(rebel,c,{intended_use:['Road fast'],brand:['Nike']}),false);
 assert.deepEqual(K.readSelection('?intended_use=Everyday+Running%2C+Quick+Runs',c),{intended_use:['Road daily','Road fast']});
});
test('bad or unlabeled editorial mappings fail validation',()=>{
 for(const mutate of [f=>f.values={},f=>f.mapping.kind='manufacturer',f=>delete f.mapping.label,f=>f.mapping.values[Object.keys(f.mapping.values)[0]]=['Unknown group'],f=>f.mapping.values[Object.keys(f.mapping.values)[0]]=[]]){
  const config=structuredClone(c);mutate(config.filters[0]);assert.ok(validate(config,data,today).errors.some(e=>e.includes('mapping')));
 }
});
test('label metadata is required and declared page labels must be in quotes',()=>{
 const p=structuredClone(data[0]);delete p.fields.drop.source_label;
 assert.ok(validate(c,[p],today).errors.some(e=>e.includes('source_label')));
 p.fields.drop.source_label=data[0].fields.drop.source_label;p.fields.drop.quote=String(p.fields.drop.value)+' mm';
 assert.ok(validate(c,[p],today).errors.some(e=>e.includes('source_label')));
});
test('unmapped source wording fails; ordinary choice filters need no mapping',()=>{
 const config=structuredClone(c);delete config.filters[0].mapping.values[data[0].fields.intended_use.value];
 assert.ok(validate(config,[data[0]],today).errors.some(e=>e.includes('allowed choices')));
 const unmapped=structuredClone(c);delete unmapped.filters[0].mapping;unmapped.filters[0].values=data.map(p=>p.fields.intended_use.value);unmapped.filters[0].values=[...new Set(unmapped.filters[0].values)];
 assert.deepEqual(validate(unmapped,data,today).errors,[]);
 assert.equal(K.matches(data[0],unmapped,{intended_use:[data[0].fields.intended_use.value]}),true);
});

test('malformed range bands return field errors instead of crashing',()=>{
 for(const bands of [{},[null],['invalid']]){const config=structuredClone(c);config.filters[1].mode='range';config.filters[1].bands=bands;assert.ok(validate(config,data,today).errors.some(e=>e.includes('range needs')));}
});
test('verbatim choice evidence is case-sensitive',()=>{
 const p=structuredClone(data[0]);p.fields.intended_use.quote=p.fields.intended_use.quote.toLowerCase();assert.ok(validate(c,[p],today).errors.some(e=>e.includes('quote does not contain')));
});
test('battery arithmetic uses the approved brief’s example inputs, not product claims',()=>{
 const r={state:'Calculated',calculation:'volts_times_amp_hours',unit:'Wh',original:[{value:48,unit:'V'},{value:14,unit:'Ah'}]};
 assert.equal(K.derived(r),672);r.original[1].unit='V';assert.ok(Number.isNaN(K.derived(r)));
});
test('benchmark does not round an oversized converted measurement down to a fit',()=>{
 // Use the verified shoe weight as a numeric benchmark, with a rounded converted display.
 const p=structuredClone(data[0]),source=p.fields.weight;
 source.state='Converted';source.original={value:source.value,unit:source.unit};source.value=Math.floor(source.value);source.decimals=0;
 const f={type:'benchmark',source:'weight',mode:'max',limit:source.value,checked:today};
 assert.equal(K.record(p,f).value,false);
});
test('publish-check CLI fails broken fixtures and passes warn-only fixtures',()=>{
 const os=require('node:os'),{spawnSync}=require('node:child_process');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fit-kit-check-'));
 try{
  const dir=path.join(root,'categories','sample');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(root,'site.json'),JSON.stringify({title:'Validation fixture',category:'sample'}));
  for(const name of ['missing-quote','non-brand-source','quote-mismatch','unknown-state','calculated-no-inputs','six-filters','stale','conflicting']){
   fs.writeFileSync(path.join(dir,'config.json'),JSON.stringify(name==='six-filters'?fixture(name):c));
   fs.writeFileSync(path.join(dir,'data.json'),JSON.stringify(name==='six-filters'?[data[0]]:fixture(name)));
   const result=spawnSync(process.execPath,[path.join(__dirname,'../scripts/publish-check.js'),root],{encoding:'utf8'});
   assert.equal(result.status,['stale','conflicting'].includes(name)?0:1,name+' '+result.stderr);
   assert.match(result.stderr,['stale','conflicting'].includes(name)?/WARNING/:/ERROR/);
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('populated luggage passes its probe rule and keeps sizes display-only',()=>{
 const config=read('categories/luggage/config.json'),products=read('categories/luggage/data.json');
 assert.equal(products.length,15);assert.equal(new Set(products.map(p=>p.brand)).size,4);
 assert.equal(config.filters.length,3);assert.ok(!config.filters.some(f=>f.type==='benchmark'));
 assert.deepEqual(config.display_fields.find(f=>f.key==='size').axes,['H','W','D']);
 assert.equal(products.filter(p=>K.matches(p,config,{wheels:['Two-wheel']})).length,2);
 assert.equal(products.filter(p=>K.matches(p,config,{shell:['Hard']})).length,7);
 const conflict=products.find(p=>p.id==='travelpro-maxlite-air-v2-spinner');assert.equal(K.matches(conflict,config,{weight:['10']}),false);
 assert.ok(validate(config,products,today).warnings.some(x=>x.includes('Conflicting')));
});
test('dimension conversions validate against published originals and benchmark axes',()=>{
 const config=structuredClone(read('categories/luggage/config.json')),product=structuredClone(read('categories/luggage/data.json')[0]);
 const f=config.display_fields.find(f=>f.key==='size'),r=product.fields.size,original=structuredClone(r.value);
 f.unit='cm';r.original={value:original,unit:'in'};r.unit='cm';r.state='Converted';r.decimals=2;r.value=K.convert(original,'in','cm').map(n=>Number(n.toFixed(2)));
 assert.deepEqual(validate(config,[product],today).errors,[]);
 const benchmark={key:'fits',type:'benchmark',source:'size',limits:K.convert(original,'in','cm'),checked:today};assert.equal(K.record(product,benchmark).value,true);
 const tooLarge=structuredClone(product);tooLarge.fields.size.original.value[0]=read('categories/luggage/data.json')[1].fields.size.value[0];assert.equal(K.record(tooLarge,benchmark).value,false);
 r.value[0]=r.value[1];assert.ok(validate(config,[product],today).errors.some(e=>e.includes('recomputed')));
});

test('original unit must be a unit token, not a letter inside the source label',()=>{
 const p=structuredClone(data.find(p=>p.model==='Vomero 18')),r=p.fields.weight;
 r.state='Converted';r.original={value:325,unit:'g'};r.decimals=1;
 r.quote=r.quote.replace('325g','325oz');
 assert.ok(validate(c,[p],today).errors.some(e=>e.includes('original input units')));
});
