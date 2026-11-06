'use strict';
const fs=require('node:fs'),path=require('node:path'),K=require('../core.js');
function validate(config,data, today=new Date().toISOString().slice(0,10)) {
  const errors=[],warnings=[];
  const err=(p,f,m)=>errors.push(`${p} / ${f}: ${m}`), warn=(p,f,m)=>warnings.push(`${p} / ${f}: ${m}`);
  const object=x=>x && typeof x==='object'&&!Array.isArray(x);
  const text=x=>typeof x==='string'&&x.trim().length>0;
  const date=(x,p,f)=>{if(!K.validDate(x))err(p,f,'checked must be a real ISO date (YYYY-MM-DD)');else if(x>today)err(p,f,'checked cannot be in the future');else if(K.stale(x,today))warn(p,f,'May be out of date (older than 12 months)');};
  if(!object(config))return {errors:['config / root: must be an object'],warnings};
  const filters=Array.isArray(config.filters)?config.filters:[];
  if(filters.length<3||filters.length>5)err('config','filters','must contain 3–5 spec filters, including benchmarks');
  for(const key of ['name','question'])if(!text(config[key]))err('config',key,'required text');
  if(!object(config.explainer)||!text(config.explainer.title)||!text(config.explainer.text))err('config','explainer','title and text required');
  if(config.price!==undefined&&typeof config.price!=='boolean')err('config','price','must be true or false');
  const brands=Array.isArray(config.brands)?config.brands:[];
  if(!Array.isArray(config.brands))err('config','brands','must be an array');
  const domainsOK=xs=>Array.isArray(xs)&&xs.length>0&&xs.every(x=>typeof x==='string'&&/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(x));
  const names=new Set();
  for(const b of brands){if(!object(b)||!text(b.name)||!domainsOK(b.domains)){err('config','brands','each brand needs name and plain allowed domains');continue;}if(names.has(b.name))err('config','brands','duplicate brand name');names.add(b.name);if(b.dealer_domains!==undefined&&(!domainsOK(b.dealer_domains)||!b.dealer_domains.every(d=>b.domains.some(base=>d.endsWith('.'+base)))))err('config',b.name,'dealer_domains must be brand-hosted subdomains of allowed manufacturer domains');}
  if(config.display_fields!==undefined&&!Array.isArray(config.display_fields))err('config','display_fields','must be an array');
  const display=Array.isArray(config.display_fields)?config.display_fields:[], all=[...filters,...display]; const keys=new Set();
  for(const f of all){
    if(!object(f)){err('config','field','must be an object');continue;}
    if(!text(f.key)||!/^[a-z][a-z0-9_]*$/.test(f.key)||['brand','sort','price'].includes(f.key)||keys.has(f.key))err('config',f.key,'key must be unique and not reserved');keys.add(f.key);
    for(const key of ['label','hint','edge_case'])if(!text(f[key]))err('config',f.key,`${key} is required`);
    if(!['number','yes_no','choice','dimensions','text','benchmark'].includes(f.type))err('config',f.key,'unknown or missing type');
    if(filters.includes(f)&&['dimensions','text'].includes(f.type))err('config',f.key,'dimensions and text are display-only');
    if(display.includes(f)&&f.type==='benchmark')err('config',f.key,'benchmark belongs in filters');
    if(['number','dimensions'].includes(f.type)&&!text(f.unit))err('config',f.key,'unit required');
    if(f.type==='choice'&&(!Array.isArray(f.values)||!f.values.length||f.values.some(v=>!text(v))||new Set(f.values).size!==f.values.length))err('config',f.key,'unique nonempty allowed string values required');
    if(f.type==='number'&&filters.includes(f)){
      if(!['min','max','range'].includes(f.mode))err('config',f.key,'mode must be min, max or range');
      if(f.mode==='range'&&(!Array.isArray(f.bands)||!f.bands.length||f.bands.some(b=>!object(b)||!text(b.id)||!text(b.label)||(b.min!=null&&!K.number(b.min))||(b.max!=null&&!K.number(b.max))||(b.min==null&&b.max==null)||(b.min!=null&&b.max!=null&&b.min>=b.max))||new Set((f.bands||[]).map(b=>b.id)).size!==(f.bands||[]).length))err('config',f.key,'range needs unique bands with numeric min and/or max');
    }
    if(f.type==='benchmark'){
      const source=all.find(x=>x?.key===f.source);
      if(!source||!['dimensions','number'].includes(source.type))err('config',f.key,'benchmark source must name a number or dimensions field');
      else if(source.type==='dimensions'&&(!Array.isArray(f.limits)||f.limits.length!==3||!f.limits.every(n=>K.number(n)&&n>0)))err('config',f.key,'three positive dimension limits required in source unit and L/W/D order');
      else if(source.type==='number'&&(!K.number(f.limit)||!['min','max'].includes(f.mode)))err('config',f.key,'numeric limit and min/max mode required');
      date(f.checked,'config',f.key);
    }
  }
  if(!Array.isArray(data)){err('data','root','must be an array');return {errors,warnings};}
  if(errors.length)return {errors,warnings};
  const ids=new Set();
  for(const p of data){
    if(!object(p)){err('product','root','must be an object');continue;}
    const label=[p.brand,p.model].filter(Boolean).join(' ')||'unnamed product';
    for(const key of ['id','brand','model','product_url'])if(!text(p[key]))err(label,key,'required text');
    if(ids.has(p.id))err(label,'id','must be unique');ids.add(p.id);
    const brand=brands.find(b=>b.name===p.brand);
    if(!brand)err(label,'brand','not in config');
    else if(!K.allowed(p.product_url,brand.domains))err(label,'product_url','must be HTTPS on this brand’s allowed domains');
    date(p.checked,label,'product');
    if(!object(p.fields)){err(label,'fields','must be an object');continue;}
    const definitions=K.fields(config);
    for(const key of Object.keys(p.fields))if(!definitions.some(f=>f.key===key))err(label,key,'field is not declared in config');
    for(const f of definitions){
      const r=p.fields[f.key];
      if(!object(r)){err(label,f.key,'value record required');continue;}
      if(!K.states.includes(r.state)){err(label,f.key,'unknown state');continue;}
      date(r.checked,label,f.key);
      if(!brand||!K.allowed(r.source_url,[...brand.domains,...(f.key==='price'?(brand.dealer_domains||[]):[])]))err(label,f.key,'source must be HTTPS on this brand’s allowed domains (dealer only for price)');
      if(['number','dimensions'].includes(f.type)&&r.unit!==f.unit)err(label,f.key,'configured unit is required, including unavailable records');
      if(brand&&f.key!=='price'&&K.allowed(r.source_url,brand.dealer_domains||[]))err(label,f.key,'dealer pages allowed for price only');
      if(['Not published','Not yet verified'].includes(r.state)){
        if(r.value!==null)err(label,f.key,'unavailable values must be null');
        if(!text(r.note))err(label,f.key,'note must explain checked omission or failed retrieval');
        continue;
      }
      if(r.value==null||r.value==='')err(label,f.key,'value required for this state');
      if(!text(r.quote))err(label,f.key,'word-for-word quote required');
      if(f.type==='number'&&(!K.number(r.value)||r.unit!==f.unit))err(label,f.key,'finite number and configured unit required');
      if(f.type==='dimensions'&&(!Array.isArray(r.value)||r.value.length!==3||!r.value.every(n=>K.number(n)&&n>0)||r.unit!==f.unit))err(label,f.key,'three positive L/W/D values and configured unit required');
      if(f.type==='yes_no'&&typeof r.value!=='boolean')err(label,f.key,'boolean value required');
      if(f.type==='choice'&&!f.values.includes(r.value))err(label,f.key,'value not in allowed choices');
      if(f.type==='text'&&!text(r.value))err(label,f.key,'text value required');
      if(r.state==='Measured differently'&&!text(r.note))err(label,f.key,'measurement note required');
      let originals;
      if(['Converted','Calculated'].includes(r.state)){
        originals=r.state==='Converted'?[r.original]:r.original;
        if(!Array.isArray(originals)||!originals.length||originals.some(x=>!object(x)||!(K.number(x.value)||(r.state==='Converted'&&Array.isArray(x.value)&&x.value.length===3&&x.value.every(K.number)))||!text(x.unit)))err(label,f.key,'structured original value/unit or calculation inputs required');
        if(!Number.isInteger(r.decimals)||r.decimals<0||r.decimals>6)err(label,f.key,'decimals must be an integer from 0 to 6');
        const expected=K.derived(r), decimals=Number.isInteger(r.decimals)&&r.decimals>=0&&r.decimals<=6?r.decimals:6;
        const eq=(a,b)=>Number.isFinite(a)&&K.number(b)&&Math.abs(Number(a.toFixed(decimals))-b)<1e-9;
        const correct=Array.isArray(expected)?Array.isArray(r.value)&&expected.length===r.value.length&&expected.every((v,i)=>eq(v,r.value[i])):eq(expected,r.value);
        if(!correct)err(label,f.key,'converted/calculated result does not match recomputed original inputs');
      }
      // Match whole numeric tokens, not 8 inside 18. Units must also occur in the quote.
      const contains=v=>{
        const s=String(v),q=r.quote||'';
        if(typeof v==='number') return (q.match(/-?\d+(?:,\d{3})*(?:\.\d+)?/g)||[]).some(token=>Number(token.replace(/,/g,''))===v);
        return q.toLowerCase().includes(s.toLowerCase());
      };
      if(typeof r.quote==='string'){
        const vals=(Array.isArray(originals)?originals.filter(object).flatMap(x=>x.value):null) || (Array.isArray(r.value)?r.value:[r.value]);
        // Boolean records carry the exact source wording as evidence_value (e.g. “Yes”).
        if(typeof r.value==='boolean'){
          if(!text(r.evidence_value)||!r.quote.includes(r.evidence_value))err(label,f.key,'yes/no record requires exact evidence_value in quote');
        }else if(!vals.every(contains))err(label,f.key,'quote does not contain the value or original inputs as written');
        if(Array.isArray(originals)&&originals.filter(object).some(x=>!r.quote.includes(x.unit)))err(label,f.key,'quote must include original input units');
      }
      if(f.key==='price'){
        if(!['manufacturer','dealer'].includes(r.price_kind))err(label,f.key,'price_kind must be manufacturer or dealer');
        if(r.price_kind==='manufacturer'&&brand&&(!K.allowed(r.source_url,brand.domains)||K.allowed(r.source_url,brand.dealer_domains||[])))err(label,f.key,'manufacturer price needs manufacturer domain');
        if(r.price_kind==='dealer'&&brand&&!K.allowed(r.source_url,brand.dealer_domains||[]))err(label,f.key,'dealer price needs configured dealer domain');
      }
      if(r.state==='Conflicting')warn(label,f.key,'Conflicting record hidden from site');
    }
  }
  return {errors,warnings};
}
function run(root=path.resolve(__dirname,'..')){
  let count=0,failed=false;
  try{
    const site=JSON.parse(fs.readFileSync(path.join(root,'site.json'),'utf8'));
    if(typeof site.title!=='string'||!site.title.trim()||typeof site.category!=='string'||!/^[a-z0-9-]+$/.test(site.category))throw Error('site.json needs title and a safe category folder name');
    for(const name of fs.readdirSync(path.join(root,'categories'))){
      const dir=path.join(root,'categories',name);if(!fs.statSync(dir).isDirectory())continue;
      try{
        const c=JSON.parse(fs.readFileSync(path.join(dir,'config.json'),'utf8'));
        const hasData=fs.existsSync(path.join(dir,'data.json'));
        if(name===site.category&&!hasData)throw Error('active category needs data.json (an empty array is allowed)');
        const d=hasData?JSON.parse(fs.readFileSync(path.join(dir,'data.json'),'utf8')):[];
        const result=validate(c,d);for(const m of result.errors)console.error(`ERROR ${name} / ${m}`);for(const m of result.warnings)console.warn(`WARNING ${name} / ${m}`);
        failed ||= !!result.errors.length; count++;
      }catch(e){console.error(`ERROR ${name}: ${e.message}`);failed=true;}
    }
    if(!fs.existsSync(path.join(root,'categories',site.category,'config.json')))throw Error('active category does not exist');
  }catch(e){console.error(`ERROR ${e.message}`);failed=true;}
  console.log(`${count} categories checked; ${failed?'FAILED':'PASSED'}. No web pages fetched.`);return failed?1:0;
}
if(require.main===module)process.exitCode=run(process.argv[2]);
module.exports={validate,run};
