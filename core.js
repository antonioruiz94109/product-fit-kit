/* Shared data rules: usable without a browser or a build step. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FitKit = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const states = ['Published', 'Converted', 'Calculated', 'Measured differently', 'Brand estimate', 'Not published', 'Conflicting', 'Not yet verified'];
  const usable = r => !!r && ['Published', 'Converted', 'Calculated'].includes(r.state);
  const units = {mm:['length',1], cm:['length',10], in:['length',25.4], g:['mass',1], kg:['mass',1000], oz:['mass',28.349523125], lb:['mass',453.59237], hours:['time',1], minutes:['time',1/60], Wh:['energy',1], kWh:['energy',1000]};
  const number = v => typeof v === 'number' && Number.isFinite(v);
  function convert(value, from, to) {
    if (Array.isArray(value)) return value.map(v=>convert(v,from,to));
    if (!number(value) || !units[from] || !units[to] || units[from][0] !== units[to][0]) return NaN;
    return value * units[from][1] / units[to][1];
  }
  function derived(r) {
    if (r.state === 'Converted') return convert(r.original?.value, r.original?.unit, r.unit);
    if (r.state === 'Calculated' && r.calculation === 'volts_times_amp_hours' && r.unit === 'Wh' && Array.isArray(r.original) && r.original.length === 2) {
      const v = r.original.find(x => x?.unit === 'V'), a = r.original.find(x => x?.unit === 'Ah');
      if (number(v?.value) && number(a?.value)) return v.value * a.value;
    }
    return NaN;
  }
  function validDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s+'T00:00:00Z').toISOString().slice(0,10) === s; }
  function stale(s, today = new Date().toISOString().slice(0,10)) {
    if (!validDate(s) || !validDate(today)) return false;
    const d = new Date(today+'T00:00:00Z'); const month = d.getUTCMonth();
    d.setUTCFullYear(d.getUTCFullYear()-1);
    if (d.getUTCMonth() !== month) d.setUTCDate(0);
    return s < d.toISOString().slice(0,10);
  }
  function allowed(url, domains) {
    try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password && !u.port && domains.some(d => u.hostname === d || u.hostname.endsWith('.'+d)); } catch { return false; }
  }
  const fields = c => [...c.filters.filter(f=>f.type !== 'benchmark'), ...(c.display_fields || []), ...(c.price ? [{key:'price',label:'Price',type:'number',unit:'USD'}] : [])];
  function record(p, f) {
    if (f.type !== 'benchmark') return p.fields[f.key];
    const r = p.fields[f.source];
    if (!r || !['Published','Converted'].includes(r.state)) return {state:'Not yet verified',value:null};
    let value;
    if (Array.isArray(r.value)) value = r.value.length === 3 && r.value.every((n,i)=>number(n) && n <= f.limits[i]);
    else value = number(r.value) && (f.mode === 'min' ? r.value >= f.limit : r.value <= f.limit);
    return {state:'Calculated',value,checked:f.checked,note:'Computed from comparable published dimensions or measurements.'};
  }
  function matches(p,c,selection,ignore) {
    return Object.entries(selection).every(([key, values]) => {
      if (key === ignore || !values || !values.length) return true;
      if (key === 'brand') return values.includes(p.brand);
      const f = c.filters.find(f=>f.key === key); if (!f) return true;
      const r = record(p,f); if (!usable(r)) return false;
      if (f.type === 'choice') return values.includes(String(r.value));
      if (f.type === 'yes_no' || f.type === 'benchmark') return r.value === true;
      if (f.type === 'number') {
        if (f.mode === 'range') return values.some(id => { const b=f.bands.find(b=>b.id === id); return b && (b.min == null || r.value >= b.min) && (b.max == null || r.value < b.max); });
        const n=Number(values[0]); return Number.isFinite(n) && (f.mode === 'max' ? r.value <= n : r.value >= n);
      }
      return true;
    });
  }
  function readSelection(search,c) {
    const q = new URLSearchParams(search), s={};
    for (const f of [{key:'brand',type:'choice',values:c.brands.map(b=>b.name)},...c.filters]) {
      let v=q.getAll(f.key);
      if (f.type === 'choice') v=v.filter(x=>f.values.includes(x));
      else if (['yes_no','benchmark'].includes(f.type)) v=v.includes('yes')?['yes']:[];
      else if (f.type === 'number' && f.mode === 'range') v=v.filter(x=>f.bands.some(b=>b.id===x));
      else if (f.type === 'number') v=v.filter(x=>x.trim()!=='' && Number.isFinite(Number(x))).slice(0,1);
      else v=[];
      if (v.length) s[f.key]=[...new Set(v)];
    } return s;
  }
  function writeSelection(s,sort='') { const q=new URLSearchParams(); for(const [key,vs] of Object.entries(s)) for(const v of vs) q.append(key,v); if(sort)q.set('sort',sort); return q.toString(); }
  function sortProducts(products,c,key='model') {
    const f=fields(c).find(f=>f.key===key) || c.filters.find(f=>f.key===key);
    return [...products].sort((a,b)=>{
      const fallback=()=>a.brand.localeCompare(b.brand)||a.model.localeCompare(b.model);
      if(!f)return fallback();
      const ar=record(a,f),br=record(b,f), au=usable(ar),bu=usable(br);
      if(au!==bu)return au?-1:1; if(!au)return fallback();
      if(key==='price' && ar.price_kind!==br.price_kind)return ar.price_kind==='manufacturer'?-1:1;
      const delta=typeof ar.value==='number'?ar.value-br.value:String(ar.value).localeCompare(String(br.value));
      return delta||fallback();
    });
  }
  return {states,usable,number,convert,derived,validDate,stale,allowed,fields,record,matches,readSelection,writeSelection,sortProducts};
});
