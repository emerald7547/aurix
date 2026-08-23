import { existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB_FILE = join(tmpdir(), 'aurix-submissions.json');

function initDB() {
    try {
        if (!existsSync(DB_FILE)) {
            writeFileSync(DB_FILE, JSON.stringify([]));
        }
    } catch (e) {
        console.error('DB init error:', e);
    }
}

function readSubmissions() {
    try {
        initDB();
        return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
        console.error('Read error:', e);
        return [];
    }
}

function writeSubmissions(data) {
    try {
        initDB();
        writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Write error:', e);
    }
}

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID required' });
        }

        let submissions = readSubmissions();
        const originalLength = submissions.length;
        submissions = submissions.filter(s => s.id !== id);

        if (submissions.length < originalLength) {
            writeSubmissions(submissions);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
}
