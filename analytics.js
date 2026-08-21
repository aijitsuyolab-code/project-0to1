(()=>{
  try{
    const endpoint='/api/visit';
    const host=location.hostname;
    let sid=localStorage.getItem('p01_sid');
    if(!sid){
      sid=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36));
      localStorage.setItem('p01_sid',sid);
    }
    let ref=null;
    try{ref=document.referrer?new URL(document.referrer).hostname:null}catch{}
    const cleanPath=(value)=>{
      const u=new URL(value,location.origin);
      ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid'].forEach(k=>u.searchParams.delete(k));
      const qs=u.searchParams.toString();
      return u.pathname+(qs?'?'+qs:'');
    };
    const send=(path)=>fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({site:host,path,session_id:sid,referrer_host:ref}),
      keepalive:true
    }).catch(()=>{});
    send(cleanPath(location.href));

    const event=(name,from=location.pathname)=>{
      const safeName=String(name||'event').replace(/[^a-z0-9_-]/gi,'_').slice(0,80);
      const safeFrom=String(from||'/').slice(0,180);
      send(`/__event/${safeName}?from=${encodeURIComponent(safeFrom)}`);
    };

    document.addEventListener('click',(ev)=>{
      const a=ev.target&&ev.target.closest?ev.target.closest('a[href]'):null;
      if(!a) return;
      let target;
      try{target=new URL(a.href,location.origin)}catch{return}
      if(target.hostname==='buy.stripe.com'){
        event(target.pathname.startsWith('/test_')?'stripe_checkout_test':'stripe_checkout');
        return;
      }
      if(target.origin!==location.origin) return;
      if(target.pathname==='/business-growth-support.html') event('growth_support_cta');
      if(location.pathname==='/business-growth-support.html'&&(target.pathname==='/'||target.pathname==='/index.html')) event('free_diagnosis_cta');
      if(location.pathname==='/business-growth-support.html'&&target.pathname==='/seo-geo.html') event('seo_geo_cta');
    },{capture:true});
  }catch{}

  try{
    const safeAdPaths=new Set(['/','/index.html','/seo-geo.html','/shopping.html']);
    if(safeAdPaths.has(location.pathname)&&!document.querySelector('script[data-p01-adsense]')){
      const s=document.createElement('script');
      s.async=true;
      s.crossOrigin='anonymous';
      s.dataset.p01Adsense='1';
      s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6147630739059940';
      document.head.appendChild(s);
    }
  }catch{}

  try{
    if(location.pathname==='/'||location.pathname==='/index.html'){
      const installResultCTA=()=>{
        const result=document.getElementById('result');
        if(!result||result.querySelector('[data-p01-growth-cta]')) return;
        const addCTA=()=>{
          if(result.classList.contains('hide')||result.querySelector('[data-p01-growth-cta]')) return;
          const wrap=document.createElement('div');
          wrap.dataset.p01GrowthCta='1';
          wrap.style.marginTop='14px';
          wrap.innerHTML='<a class="btn" href="/business-growth-support.html" style="display:block">次に直すところを見る｜SEO/GEO・AI・海外展開</a><p class="foot" style="margin:8px 0 0">診断結果から、必要な改善だけを確認できます。</p>';
          result.appendChild(wrap);
        };
        new MutationObserver(addCTA).observe(result,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});
        addCTA();
      };
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installResultCTA,{once:true});
      else installResultCTA();
    }
  }catch{}
})();
