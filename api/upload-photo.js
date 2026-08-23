import { randomUUID } from 'node:crypto';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Supabase storage credentials are not configured' });
    const chunks=[]; for await (const chunk of req) chunks.push(chunk); const body=Buffer.concat(chunks);
    const contentType=req.headers['content-type']||'';
    const match=contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i); const boundary=match?.[1]||match?.[2];
    if(!boundary) return res.status(400).json({error:'Invalid upload'});
    const raw=body.toString('binary'); const marker='\r\n\r\n'; const start=raw.indexOf(marker)+marker.length; const end=raw.lastIndexOf('\r\n--'+boundary);
    if(start<marker.length||end<start) return res.status(400).json({error:'Invalid upload'});
    const header=raw.slice(0,start); const nameMatch=header.match(/filename="([^"]+)"/i); const typeMatch=header.match(/Content-Type:\s*([^\r\n]+)/i);
    const filename=nameMatch?.[1]||'image'; const mime=typeMatch?.[1]?.trim()||'application/octet-stream'; const file=Buffer.from(raw.slice(start,end),'binary');
    if(file.length>10*1024*1024)return res.status(413).json({error:'Image must be 10 MB or smaller'});
    const safe=filename.replace(/[^a-zA-Z0-9._-]/g,'_'); const path=`briefs/${Date.now()}-${randomUUID()}-${safe}`;
    const upload=await fetch(`${supabaseUrl.replace(/\/$/,'')}/storage/v1/object/aurix-uploads/${path}`,{method:'POST',headers:{Authorization:`Bearer ${serviceKey}`,apikey:serviceKey,'Content-Type':mime,x-upsert:'false'},body:file});
    if(!upload.ok){const text=await upload.text();console.error(text);return res.status(500).json({error:'Could not store image'});}
    return res.status(200).json({path,filename,contentType:mime});
  }catch(e){console.error(e);return res.status(500).json({error:'Photo upload failed'});}
}
