import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../submissions.json');

function initDB() {
    try {
        if (!existsSync(DB_FILE)) {
            writeFileSync(DB_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.log('Note: Using in-memory storage on Vercel (no file persistence)');
    }
}

// In-memory fallback for Vercel
let inMemoryDB = [];

function readSubmissions() {
    try {
        if (existsSync(DB_FILE)) {
            return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
        }
    } catch (error) {
        console.log('Using in-memory storage');
    }
    return inMemoryDB;
}

function writeSubmissions(data) {
    try {
        if (existsSync(path.dirname(DB_FILE))) {
            writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('Storing in memory (Vercel limitation)');
    }
    inMemoryDB = data;
}

export default function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const {
        name,
        email,
        phone,
        instagram,
        businessName,
        businessDescription,
        goal,
        style,
        colors,
        hasContent,
        additionalInfo,
        timeline,
        features,
        imageUrl
    } = req.body;

    // Validate required fields
    if (!name || !email || !businessName) {
        return res.status(400).json({ error: 'Missing required fields: name, email, businessName' });
    }

    if (!phone && !instagram) {
        return res.status(400).json({ error: 'Please provide either phone number or Instagram ID' });
    }

    const submission = {
        id: Date.now().toString(),
        name,
        email,
        phone: phone || 'Not provided',
        instagram: instagram || 'Not provided',
        businessName,
        businessDescription,
        goal,
        style,
        colors,
        hasContent,
        additionalInfo,
        timeline,
        features: Array.isArray(features) ? features : [],
        imageUrl: imageUrl || null,
        submittedAt: new Date().toISOString()
    };

    try {
        initDB();
        const submissions = readSubmissions();
        submissions.push(submission);
        writeSubmissions(submissions);
        
        console.log(`✓ New submission from ${name} (${email})`);
        console.log(`  Phone: ${phone || 'N/A'}, Instagram: ${instagram || 'N/A'}`);
        
        res.status(200).json({ 
            success: true, 
            id: submission.id,
            message: 'Brief submitted successfully!'
        });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ error: 'Failed to save submission. Please try again.' });
    }
}
