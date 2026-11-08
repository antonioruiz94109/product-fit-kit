/* All category-specific behavior comes from JSON. */
'use strict';
(async function () {
  const K=window.FitKit,$=id=>document.getElementById(id);
  const make=(tag,text,className)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(className)e.className=className;return e;};
  const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error(`Could not load ${url} (${r.status}).`);return r.json();};
  const safeLink=(url,text)=>{const a=make('a',text);try{if(new URL(url).protocol==='https:')a.href=url;}catch{}a.target='_blank';a.rel='noopener noreferrer';return a;};
  try {
    const site=await get('site.json');
    if(!/^[a-z0-9-]+$/.test(site.category))throw Error('The active category folder is invalid.');
    const [config,products]=await Promise.all([get(`categories/${site.category}/config.json`),get(`categories/${site.category}/data.json`)]);
    if(!Array.isArray(products)||!Array.isArray(config.filters)||!Array.isArray(config.brands))throw Error('The category files have an invalid format. Run the publish check.');
    document.title=site.title;$('heading').textContent=config.name;$('question').textContent=config.question;
    if(config.notice){$('notice').hidden=false;$('notice').textContent=config.notice;}
    if(config.notes){$('category-notes').hidden=false;$('category-notes').textContent=config.notes;}
    if(config.explainer){$('explainer').hidden=false;$('explainer-title').textContent=config.explainer.title;$('explainer-text').textContent=config.explainer.text;}
    let selection=K.readSelection(location.search,config);
    const sortFields=[...config.filters.filter(f=>['number','choice'].includes(f.type)),...(config.price?[{key:'price',label:'Price'}]:[])];
    for(const f of sortFields){const o=make('option',f.label.replace('[brand]','brand'));o.value=f.key;$('sort').append(o);}
    const initialSort=new URLSearchParams(location.search).get('sort');$('sort').value=sortFields.some(f=>f.key===initialSort)?initialSort:'model';
    const counts=[];
    const mobile=window.matchMedia('(max-width: 767px)');
    let filtersOpen=false;
    function setFilterPanel(open,returnFocus=false){
      filtersOpen=open;
      $('filter-panel').hidden=mobile.matches&&!filtersOpen;
      $('filter-toggle').setAttribute('aria-expanded',String(mobile.matches&&filtersOpen));
      if(returnFocus&&mobile.matches)$('filter-toggle').focus();
    }
    $('filter-toggle').addEventListener('click',()=>setFilterPanel(!filtersOpen));
    $('show-results').addEventListener('click',()=>{setFilterPanel(false);$('results').focus();$('results').scrollIntoView({block:'start'});});
    $('filter-panel').addEventListener('keydown',event=>{if(event.key==='Escape'&&mobile.matches){event.preventDefault();setFilterPanel(false,true);}});
    mobile.addEventListener('change',()=>setFilterPanel(false));
    setFilterPanel(false);
    function updateURL(){const q=K.writeSelection(selection,$('sort').value==='model'?'':$('sort').value);history.replaceState(null,'',location.pathname+(q?'?'+q:'')+location.hash);}
    function changed(key,values){if(values.length)selection[key]=values;else delete selection[key];updateURL();renderResults();}
    function renderFilters(){
      $('filters').replaceChildren();counts.length=0;
      const fs=[{key:'brand',label:'Brand',type:'choice',hint:'Choose one or more brands.',values:config.brands.map(b=>b.name)},...config.filters];
      for(const f of fs){
        const group=make('fieldset',null,'filter-group');group.append(make('legend',f.label.replace('[brand]','brand')),make('p',f.hint,'hint'));
        if(f.type==='choice'||(f.type==='number'&&f.mode==='range')){
          const choices=f.type==='choice'?f.values.map(v=>({id:v,label:v})):f.bands;
          const chips=make('div',null,'chips');
          for(const choice of choices){
            const b=make('button',null,'chip');b.type='button';b.setAttribute('aria-pressed',String((selection[f.key]||[]).includes(choice.id)));b.append(make('span',choice.label));
            const count=make('span',null,'count');b.append(count);counts.push({node:count,f,choice:choice.id});
            b.addEventListener('click',()=>{const vs=new Set(selection[f.key]||[]);vs.has(choice.id)?vs.delete(choice.id):vs.add(choice.id);changed(f.key,[...vs]);b.setAttribute('aria-pressed',String(vs.has(choice.id)));});chips.append(b);
          }group.append(chips);
        }else if(['yes_no','benchmark'].includes(f.type)){
          const label=make('label',null,'toggle'),input=make('input');input.type='checkbox';input.checked=!!selection[f.key]?.length;input.addEventListener('change',()=>changed(f.key,input.checked?['yes']:[]));label.append(input,make('span','Require this'));group.append(label);
          if(f.type==='benchmark')group.append(make('span',`Benchmark checked ${f.checked}`,'available'));
        }else if(f.type==='number'){
          const label=make('label',null,'numeric');label.append(make('span',f.mode==='max'?'At most':'At least'));const input=make('input');input.type='number';input.step='any';input.placeholder='Any';input.value=selection[f.key]?.[0]||'';input.setAttribute('aria-label',`${f.label}: ${f.mode==='max'?'maximum':'minimum'} ${f.unit}`);input.addEventListener('input',()=>changed(f.key,input.value!==''&&Number.isFinite(Number(input.value))?[input.value]:[]));label.append(input,make('span',f.unit));group.append(label);
        }
        if(f.key!=='brand'){const available=make('span',null,'available');counts.push({node:available,f});group.append(available);}
        $('filters').append(group);
      }
    }
    function valueText(r,f){
      if(f.type==='benchmark'&&!K.usable(r))return 'Cannot determine';
      if(r.state==='Not published')return null;
      if(r.state==='Not yet verified')return 'Not yet verified';
      if(typeof r.value==='boolean')return r.value?'Yes':'No';
      if(Array.isArray(r.value))return `${r.value.map((v,i)=>`${(f.axes||['L','W','D'])[i]} ${v}`).join(' × ')} ${r.unit||''}`;
      if(f.key==='price')return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(r.value);
      return `${r.value}${r.unit?' '+r.unit:''}`;
    }
    function card(p){
      const article=make('article',null,'card');article.dataset.productId=p.id;article.append(make('p',p.brand,'brand'),make('h3',p.model));const productLink=safeLink(p.product_url,'View on brand site ↗');productLink.className='product-link';article.append(productLink);
      const dl=make('dl',null,'specs');
      const definitions=[...config.filters,...(config.display_fields||[]),...(config.price?[{key:'price',label:'Price',type:'number',unit:'USD'}]:[])];
      for(const f of definitions){
        const r=K.record(p,f);if(!r||r.state==='Conflicting')continue;
        const row=make('div',null,'spec');row.dataset.field=f.key;row.append(make('dt',f.label.replace('[brand]',p.brand)));
        const dd=make('dd',r.state==='Not published'?`Not published by ${p.brand}`:valueText(r,f));
        const labels={'Published':'Published','Converted':'Converted','Calculated':'Calculated from published specs','Measured differently':'Measured differently','Brand estimate':'Brand estimate'};
        if(labels[r.state])dd.append(make('span',labels[r.state],'state'));
        if(r.state==='Not yet verified')dd.classList.add('unverified');
        if(f.mapping&&K.usable(r))dd.append(make('span',`${f.mapping.label}: ${K.choiceGroups(f,r.value).join(' / ')}`,'state'));
        if(r.note)dd.append(make('span',r.note,'spec-note'));
        if(f.key==='price'&&r.price_kind==='dealer'){dd.append(make('span',`Dealer price, checked ${r.checked}`,'state'));dd.append(safeLink(r.source_url,'View dealer price ↗'));}
        if(f.key==='price'&&r.price_kind==='manufacturer')dd.append(make('span',`Manufacturer US price, checked ${r.checked}`,'state'));
        if(r.state==='Converted'){
          const details=make('details');const summary=make('summary','Original measurement','original');summary.title=`${r.original.value} ${r.original.unit}`;details.append(summary,make('p',`${r.original.value} ${r.original.unit}`));dd.append(details);
        }
        if(f.type==='benchmark')dd.append(make('span',`Benchmark checked ${f.checked}`,'spec-note'));
        else{
          const evidence=make('details',null,'evidence');evidence.append(make('summary',r.quote?'Source & exact quote':'Source & check details'));
          if(r.quote)evidence.append(make('blockquote',r.quote));evidence.append(safeLink(r.source_url,'Open source ↗'),make('span',` · Checked ${r.checked}`));
          if(r.qualifier_quote&&r.qualifier_url){
            evidence.append(make('p','Evidence for the field qualifier'),make('blockquote',r.qualifier_quote),safeLink(r.qualifier_url,'Open qualifier source ↗'));
          }
          if(r.original)evidence.append(make('p','Published original: '+(Array.isArray(r.original)?r.original.map(x=>`${x.value} ${x.unit}`).join(' × '):`${r.original.value} ${r.original.unit}`)));
          dd.append(evidence);
        }
        if(K.stale(r.checked))dd.append(make('span','May be out of date.','stale'));row.append(dd);dl.append(row);
      }
      article.append(dl);const checked=make('p',`Product checked ${p.checked}`,'checked');if(K.stale(p.checked))checked.append(make('span','May be out of date.','stale'));article.append(checked);return article;
    }
    function renderResults(){
      const found=K.sortProducts(products.filter(p=>K.matches(p,config,selection)),config,$('sort').value);
      $('filter-toggle').textContent=`Filters (${Object.keys(selection).length})`;
      $('show-results').textContent=`Show ${found.length}`;
      $('result-count').textContent=`Showing ${found.length} of ${products.length}`;$('cards').replaceChildren(...found.map(card));
      $('empty').hidden=found.length>0;
      $('empty-title').textContent=products.length?'No matches just yet.':'Your next shortlist starts here.';
      $('empty-text').textContent=products.length?'Try removing a filter or choose Reset all to see every product.':'This category is ready for research. Add verified products to its data file when you’re ready.';
      for(const item of counts){
        const candidates=products.filter(p=>K.matches(p,config,selection,item.f.key));
        if(item.choice!==undefined){const n=candidates.filter(p=>K.matches(p,config,{[item.f.key]:[item.choice]})).length;item.node.textContent=`(${n})`;}
        else item.node.textContent=`${candidates.filter(p=>K.usable(K.record(p,item.f))).length} with comparable values`;
      }
    }
    $('reset').addEventListener('click',()=>{selection={};$('sort').value='model';updateURL();renderFilters();renderResults();});
    $('sort').addEventListener('change',()=>{updateURL();renderResults();});
    window.addEventListener('popstate',()=>{selection=K.readSelection(location.search,config);const s=new URLSearchParams(location.search).get('sort');$('sort').value=sortFields.some(f=>f.key===s)?s:'model';renderFilters();renderResults();});
    renderFilters();renderResults();$('workspace').hidden=false;
  }catch(error){$('question').textContent='The category could not be loaded.';$('error').hidden=false;$('error').textContent=`${error.message} Serve this folder over HTTP rather than opening index.html directly.`;console.error(error);}
})();
