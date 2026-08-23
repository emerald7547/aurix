import { existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB_FILE = join(tmpdir(), 'aurix-submissions.json');

function initDB() {
    try {
        if (!existsSync(DB_FILE)) {
            const fs = require('fs');
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
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

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const submissions = readSubmissions();
        res.status(200).json(submissions);
    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({ error: 'Failed to read submissions' });
    }
}
