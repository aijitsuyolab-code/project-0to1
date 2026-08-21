export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({
    ok:true,
    service:'project-0to1',
    runtime:'vercel',
    checks:{static:true,api:true}
  });
}
