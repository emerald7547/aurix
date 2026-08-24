import { ensureTable, getDb } from '../lib/db.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await ensureTable();
        const db = getDb();
        const rows = await db`
            SELECT id, name, email, phone, business_name, business_description,
                   goal, style, colors, has_content, additional_info, timeline,
                   features, submitted_at
            FROM aurix_submissions
            ORDER BY submitted_at DESC
        `;

        const submissions = rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            businessName: row.business_name,
            businessDescription: row.business_description || '',
            goal: row.goal || '',
            style: row.style || '',
            colors: row.colors || '',
            hasContent: row.has_content || '',
            additionalInfo: row.additional_info || '',
            timeline: row.timeline || '',
            features: Array.isArray(row.features) ? row.features : [],
            submittedAt: row.submitted_at
        }));

        return res.status(200).json(submissions);
    } catch (error) {
        console.error('Error reading submissions:', error);
        return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
}
