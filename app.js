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
app.get('/publish', async (req, res) => {
    res.render('publish');
});

// Publish page route
app.get('/indexAdmin', async (req, res) => {
    const { passSure } = req.query;
    if (passSure == "parolb123456") {
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
            res.render('admin', { entries: filteredEntries, searchQuery });
        } catch (error) {
            console.error('Error details:', error.message);
            if (error.response) {
                return res.status(error.response.status).send(error.response.data);
            }
            res.status(500).send('Error retrieving entries from the database.');
        }
    } else {
        res.status(404).send(`        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error</title>
        </head>
        <body>
            <code>Cannot GET /indexAdmin</code>
        </body>
        </html>`)
    }
});

// Publish entry route
app.post('/publish', async (req, res) => {
    const { title, description, code, language } = req.body;

    // Validate inputs
    if (!title || !description || !code || !language) {
        return res.status(400).send('All fields are required.');
    }

    const newEntry = { [title]: { description, code, language } };

    try {
        // Insert the entry into the database via the /add endpoint
        const response = await axios.post(`${dbUrl}add`, newEntry);
        res.redirect('/'); // Redirect after successful publish
    } catch (error) {
        console.error('Error saving entry:', error); // Log the error
        if (error.response) {
            return res.status(error.response.status).send(error.response.data); // Send error from the database
        }
        res.status(500).send('Error publishing entry to the database.'); // Respond with a generic message
    }
});

app.delete('/delete', async (req, res) => {
    const { key } = req.query;
    const response = await axios.delete(`${dbUrl}remove?key=${key}`)
    res.redirect('/');
})

// Individual entry route
app.get('/entry/:title', async (req, res) => {
    const title = req.params.title; // Retrieve the title from the parameters
    try {
        const response = await axios.get(`${dbUrl}info/${title}`);
        if (response.data.exists) {
            res.render('entry', { entry: response.data.value });
        } else {
            res.status(404).send('Entry not found');
        }
    } catch (error) {
        console.error('Error details:', error.message);
        res.status(500).send('Error retrieving entry from the database.');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
