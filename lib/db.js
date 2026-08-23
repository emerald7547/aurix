import postgres from 'postgres';

let sql;

function getSql() {
    if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL is not configured in Vercel Environment Variables');
    }
    if (!sql) {
        sql = postgres(process.env.POSTGRES_URL, {
            ssl: 'require',
            max: 1,
            prepare: false
        });
    }
    return sql;
}

export async function ensureTable() {
    const db = getSql();
    await db`
        CREATE TABLE IF NOT EXISTS aurix_submissions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            business_name TEXT NOT NULL,
            business_description TEXT,
            goal TEXT,
            style TEXT,
            colors TEXT,
            has_content TEXT,
            additional_info TEXT,
            timeline TEXT,
            features JSONB NOT NULL DEFAULT '[]'::jsonb,
            submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;
}

export function getDb() {
    return getSql();
}
