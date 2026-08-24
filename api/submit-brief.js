import { randomUUID } from 'node:crypto';
import { ensureTable, getDb } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, instagram, businessName, businessDescription, goal, style, colors, hasContent, additionalInfo, timeline, features, imageUrl } = req.body || {};
    if (!name || !email || !businessName) return res.status(400).json({ error: 'Missing required fields: name, email, businessName' });
    if (!phone && !instagram) return res.status(400).json({ error: 'Please provide either phone number or Instagram ID' });

    await ensureTable();
    const db = getDb();
    const id = randomUUID();
    const safeFeatures = Array.isArray(features) ? features : [];

    await db`
      INSERT INTO aurix_submissions (id, name, email, phone, business_name, business_description, goal, style, colors, has_content, additional_info, timeline, features)
      VALUES (${id}, ${name}, ${email}, ${phone || 'Not provided'}, ${businessName}, ${businessDescription || ''}, ${goal || ''}, ${style || ''}, ${colors || ''}, ${hasContent || ''}, ${additionalInfo || ''}, ${timeline || ''}, ${JSON.stringify(safeFeatures)}::jsonb)
    `;

    return res.status(200).json({ success: true, id, message: 'Brief submitted successfully!' });
  } catch (error) {
    console.error('Error saving submission:', error);
    return res.status(500).json({ error: 'Failed to save submission. Please try again.' });
  }
}
