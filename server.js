const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, './')));
app.use(express.static(path.join(__dirname, '/public')));

app.get('/api/notes', (req, res) => {
    const savedNotes = req.cookies.savedNotes || [];
    res.json(savedNotes);
});

app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content required.' });
    }
    const timestamp = new Date().getTime();
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.txt`;
    fs.writeFile(`./notes/${filename}`, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to save' });
        }
        const savedNotes = req.cookies.savedNotes || [];
        savedNotes.push({ title, link: `/notes/${filename}` });
        res.cookie('savedNotes', savedNotes, { maxAge: 365 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ message: 'Note saved', link: `/notes/${filename}` });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
