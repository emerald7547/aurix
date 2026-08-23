import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../submissions.json');

// In-memory fallback for Vercel
let inMemoryDB = [];

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        let submissions = [];
        
        try {
            if (existsSync(DB_FILE)) {
                const data = readFileSync(DB_FILE, 'utf-8');
                submissions = JSON.parse(data);
            }
        } catch (error) {
            console.log('Using in-memory storage');
            submissions = inMemoryDB;
        }

        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error reading submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
}
