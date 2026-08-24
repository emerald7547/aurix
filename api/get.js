import { ensureTable, getDb } from '../lib/db.js';
export default async function handler(req,res){
  res.setHeader('Content-Type','application/json');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  try{
    await ensureTable(); const db=getDb();
    const rows=await db`SELECT id,name,email,phone,instagram,business_name,business_description,goal,style,colors,has_content,additional_info,timeline,features,images,status,status_message,approved_at,completed_at,submitted_at FROM aurix_submissions ORDER BY submitted_at DESC`;
    return res.status(200).json(rows.map(r=>({id:r.id,name:r.name,email:r.email,phone:r.phone,instagram:r.instagram,businessName:r.business_name,businessDescription:r.business_description||'',goal:r.goal||'',style:r.style||'',colors:r.colors||'',hasContent:r.has_content||'',additionalInfo:r.additional_info||'',timeline:r.timeline||'',features:Array.isArray(r.features)?r.features:[],images:Array.isArray(r.images)?r.images:[],status:r.status||'pending',statusMessage:r.status_message||'',approvedAt:r.approved_at,completedAt:r.completed_at,submittedAt:r.submitted_at})));
  }catch(error){console.error(error);return res.status(500).json({error:'Failed to fetch submissions'});}
}
