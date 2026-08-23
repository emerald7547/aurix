import { existsSync, readFileSync } from 'fs';

const DB_FILE = '/tmp/submissions.json';

function initDB() {
    if (!existsSync(DB_FILE)) {
        import('fs').then(fs => fs.writeFileSync(DB_FILE, JSON.stringify([])));
    }
}

function readSubmissions() {
    try {
        return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        initDB();
        const submissions = readSubmissions();
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to read' });
    }
}
