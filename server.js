const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// The target domain we want to fetch securely behind the scenes
const TARGET_URL = 'https://now.gg'; 

// Route all incoming traffic through the proxy handler
app.all('*', async (req, res) => {
    // Construct the destination URL preserving the path and query parameters
    const proxyUrl = TARGET_URL + req.url;

    try {
        // Forward the request from the server, not the client's browser
        const response = await fetch(proxyUrl, {
            method: req.method,
            headers: {
                // Mimic a standard user agent to avoid bot-blocking headers
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0'
            },
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined
        });

        // Copy the target server's headers back to our browser response
        res.set(Object.fromEntries(response.headers.entries()));
        res.status(response.status);

        // Pipe the raw body content (HTML, JS, Images) back to the browser
        response.body.pipe(res);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).send('Proxy failed to route the connection.');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is actively running on port ${PORT}`);
});
