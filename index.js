require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

// My code /////////////////////////////////////////////////////////////////
// simple data storage
let urlDatabase = {};

// URL verification
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

app.post("/api/shorturl", (req, res) => {
    let longUrl = req.body.url;

    if (!isValidUrl(longUrl)) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    let host = new URL(longUrl).host;
    dns.lookup(host, (err) => {
        if (err) {
            return res.status(400).json({ error: "Invalid URL - Host not found" });
        }

        let shortId = shortid.generate();
        urlDatabase[shortId] = longUrl;

        res.json({ longUrl: longUrl, shortUrl: shortId });
    });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
    let short = req.params.shortUrl;

    let url = urlDatabase[short];

    if (url) {
        res.redirect(url);
    } else {
        res.status(404).json({ error: "URL not found" });
    }
})

////////////////////////////////////////////////////////////////////////////

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
