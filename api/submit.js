import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DB_FILE = '/tmp/submissions.json';

function initDB() {
    if (!existsSync(DB_FILE)) {
        writeFileSync(DB_FILE, JSON.stringify([]));
    }
}

function readSubmissions() {
    try {
        return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

function writeSubmissions(data) {
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, businessName, businessDescription, goal, style, colors, hasContent, additionalInfo, timeline, features } = req.body;

    if (!name || !email || !phone || !businessName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        businessName,
        businessDescription,
        goal,
        style,
        colors,
        hasContent,
        additionalInfo,
        timeline,
        features: Array.isArray(features) ? features : [],
        submittedAt: new Date().toISOString()
    };

    try {
        initDB();
        const submissions = readSubmissions();
        submissions.push(submission);
        writeSubmissions(submissions);
        console.log(`✓ New submission from ${name}`);
        res.status(200).json({ success: true, id: submission.id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save' });
    }
}
