export async function onRequest(context){
  return new Response(JSON.stringify({
    ok:true,
    service:'project-0to1',
    runtime:'cloudflare-pages',
    checks:{static:true,api:true}
  }),{
    status:200,
    headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store'
    }
  });
}
