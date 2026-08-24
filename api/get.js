import { ensureTable, getDb } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTable();
    const db = getDb();
    const rows = await db`
      SELECT id, name, email, phone, business_name AS "businessName",
             business_description AS "businessDescription", goal, style, colors,
             has_content AS "hasContent", additional_info AS "additionalInfo",
             timeline, features, submitted_at AS "submittedAt"
      FROM aurix_submissions
      ORDER BY submitted_at DESC
    `;
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}
