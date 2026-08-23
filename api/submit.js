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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { name, email, phone, businessName, businessDescription, goal, style, colors, hasContent, additionalInfo, timeline, features } = req.body || {};
        if (!name || !email || !phone || !businessName) return res.status(400).json({ error: 'Missing required fields' });
        await ensureTable();
        const id = Date.now().toString();
        await db()`INSERT INTO aurix_submissions
            (id, name, email, phone, business_name, business_description, goal, style, colors, has_content, additional_info, timeline, features)
            VALUES (${id}, ${name}, ${email}, ${phone}, ${businessName}, ${businessDescription || ''}, ${goal || ''}, ${style || ''}, ${colors || ''}, ${hasContent || ''}, ${additionalInfo || ''}, ${timeline || ''}, ${JSON.stringify(Array.isArray(features) ? features : [])}::jsonb)`;
        return res.status(200).json({ success: true, id });
    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Failed to save submission' });
    }
}
