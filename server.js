import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'submissions.json');

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

app.post('/api/submit-brief', (req, res) => {
    const { name, email, phone, businessName, businessDescription, goal, style, colors, hasContent, additionalInfo, timeline, features, submittedAt } = req.body;

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

    const submissions = readSubmissions();
    submissions.push(submission);
    writeSubmissions(submissions);

    console.log(`✓ New submission from ${name} (${email})`);

    res.json({ success: true, id: submission.id });
});

app.get('/api/get-submissions', (req, res) => {
    const submissions = readSubmissions();
    res.json(submissions);
});

app.delete('/api/delete-submission/:id', (req, res) => {
    const { id } = req.params;
    let submissions = readSubmissions();
    submissions = submissions.filter(s => s.id !== id);
    writeSubmissions(submissions);
    res.json({ success: true });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    initDB();
    console.log(`✓ AURIX server running on http://localhost:${PORT}`);
    console.log(`✓ Admin dashboard: http://localhost:${PORT}/admin`);
});
