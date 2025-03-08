const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;
const dbUrl = 'http://67.220.85.146:6048/';

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Main page route
app.get('/', async (req, res) => {
    const searchQuery = req.query.search || '';
    try {
        const response = await axios.get(`${dbUrl}db`);
        const entries = response.data;

        // Check if entries is an object
        const transformedEntries = Array.isArray(entries)
            ? entries
            : Object.entries(entries).map(([key, value]) => ({
                title: key,
                ...value
            }));

        const filteredEntries = transformedEntries.filter(entry => 
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.language.toLowerCase().includes(searchQuery.toLowerCase())
        );

        res.render('index', { entries: filteredEntries, searchQuery });
    } catch (error) {
        console.error('Error details:', error.message);
        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        }
        res.status(500).send('Error retrieving entries from the database.');
    }
});

// Publish page route
app.get('/publish', (req, res) => {
    res.render('publish');
});

// Publish entry route
app.post('/publish', async (req, res) => {
    const { title, description, code, language } = req.body;
    if (title && description && code && language) {
        try {
            await axios.post(`${dbUrl}add`, { key: title, value: { description, code, language } });
        } catch (error) {
            return res.status(500).send('Error publishing entry to the database.');
        }
    }
    res.redirect('/');
});

// Individual entry route
app.get('/entry/:id', async (req, res) => {
    const entryId = req.params.id;
    try {
        const response = await axios.get(`${dbUrl}info/${entryId}`);
        if (response.data.exists) {
            res.render('entry', { entry: response.data.value });
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        res.status(500).send('Error retrieving entry from the database.');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
