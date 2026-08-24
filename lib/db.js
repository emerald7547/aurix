import postgres from 'postgres';

let sql;
function getSql(){
  if(!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is not configured in Vercel Environment Variables');
  if(!sql) sql=postgres(process.env.POSTGRES_URL,{ssl:'require',max:1,prepare:false});
  return sql;
}
export async function ensureTable(){
  const db=getSql();
  await db`CREATE TABLE IF NOT EXISTS aurix_submissions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
    instagram TEXT, business_name TEXT NOT NULL, business_description TEXT,
    goal TEXT, style TEXT, colors TEXT, has_content TEXT, additional_info TEXT,
    timeline TEXT, features JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT NOT NULL DEFAULT 'pending',
    status_message TEXT, approved_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS instagram TEXT`;
  await db`ALTER TABLE aurix_submissions ALTER COLUMN phone DROP NOT NULL`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS status_message TEXT`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`;
  await db`ALTER TABLE aurix_submissions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
}
export function getDb(){return getSql();}
