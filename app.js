const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Store published entries
let entries = [];

// Main page route
// Main page route
app.get('/', (req, res) => {
    const searchQuery = req.query.search || '';
    const filteredEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
    res.render('index', { entries: filteredEntries, searchQuery });
});

// Publish page route
app.get('/publish', (req, res) => {
    res.render('publish');
});

// Publish entry route
app.post('/publish', (req, res) => {
    const { title, description, code, language } = req.body;
    if (title && description && code && language) {
        entries.push({ title, description, code, language });
    }
    res.redirect('/');
});

// Individual entry route
app.get('/entry/:id', (req, res) => {
    const entryId = parseInt(req.params.id, 10);
    if (entryId >= 0 && entryId < entries.length) {
        res.render('entry', { entry: entries[entryId] });
    } else {
        res.status(404).send('Entry not found');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});