import postgres from 'postgres';

let sql;
function db() {
    if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is not configured');
    if (!sql) sql = postgres(process.env.POSTGRES_URL, { ssl: 'require', max: 1, prepare: false });
    return sql;
}

async function ensureTable() {
    await db()`CREATE TABLE IF NOT EXISTS aurix_submissions (
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
    )`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
        await ensureTable();
        const rows = await db()`SELECT id, name, email, phone, business_name AS "businessName", business_description AS "businessDescription", goal, style, colors, has_content AS "hasContent", additional_info AS "additionalInfo", timeline, features, submitted_at AS "submittedAt" FROM aurix_submissions ORDER BY submitted_at DESC`;
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Failed to read submissions' });
    }
}
