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
    const u=new URL(location.href);
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','msclkid'].forEach(k=>u.searchParams.delete(k));
    const qs=u.searchParams.toString();
    const path=u.pathname+(qs?'?'+qs:'');
    fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({site:host,path,session_id:sid,referrer_host:ref}),
      keepalive:true
    }).catch(()=>{});
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
