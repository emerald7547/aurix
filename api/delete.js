import { existsSync, readFileSync, writeFileSync } from 'fs';

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
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'ID required' });
    }

    try {
        initDB();
        let submissions = readSubmissions();
        submissions = submissions.filter(s => s.id !== id);
        writeSubmissions(submissions);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete' });
    }
}
