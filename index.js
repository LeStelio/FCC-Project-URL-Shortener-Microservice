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



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
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

app.post('/api/shorturl', (req, res) => {
  let longUrl = req.body.url;

  if (!isValidUrl(longUrl)) {
    return res.json({ error: 'invalid url' });
  }
  
  let host = new URL(longUrl).host;
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    let shortId = shortid.generate();
    urlDatabase[shortId] = longUrl;

    res.json({ original_url: longUrl, short_url: shortId });
  });
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  let short = req.params.shortUrl;

  let url = urlDatabase[short];
  
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).json({ error: 'url not found' });
  }
})

////////////////////////////////////////////////////////////////////////////

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
