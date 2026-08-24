import { ensureTable, getDb } from '../lib/db.js';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{await ensureTable();const {id,action}=req.body||{};if(!id||!['approve','complete','delete','building','deploying'].includes(action))return res.status(400).json({error:'Invalid action'});const db=getDb();
    if(action==='delete') await db`DELETE FROM aurix_submissions WHERE id=${id}`;
    else if(action==='approve') await db`UPDATE aurix_submissions SET status='approved',status_message='Approved — work can begin.',approved_at=NOW() WHERE id=${id}`;
    else if(action==='complete') await db`UPDATE aurix_submissions SET status='complete',status_message='Website completed and ready.',completed_at=NOW() WHERE id=${id}`;
    else if(action==='building') await db`UPDATE aurix_submissions SET status='building',status_message='Your website is being built.' WHERE id=${id}`;
    else if(action==='deploying') await db`UPDATE aurix_submissions SET status='deploying',status_message='Your website is being deployed.' WHERE id=${id}`;
    return res.status(200).json({success:true});
  }catch(e){console.error(e);return res.status(500).json({error:'Action failed'});}
}
