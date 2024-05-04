// Import required modules
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define the POST route to handle streaming requests
app.post('/dl', async (req, res) => {
  const { sourceUrl, targetUrl } = req.body;

  // Validate that URLs are provided
  if (!sourceUrl || !targetUrl) {
    return res.status(400).json({ message: 'Missing source or target URL parameters.' });
  }

  try {
    // Create a writable stream to the target URL
    const writableStream = fs.createWriteStream(targetUrl);

    // Fetch the file from the source URL and pipe it to the writable stream
    const response = await axios({
      method: 'get',
      url: sourceUrl,
      responseType: 'stream'
    });

    response.data.pipe(writableStream);

    // Handle stream errors and success
    response.data.on('error', err => {
      console.error(`Error downloading from URL: ${err}`);
      res.status(500).json({ message: `Error downloading from URL: ${err.message}` });
    });

    writableStream.on('error', err => {
      console.error(`Error writing to file: ${err}`);
      res.status(500).json({ message: `Error writing to file: ${err.message}` });
    });

    writableStream.on('finish', () => {
      console.log('File successfully written!');
      res.json({ message: 'File successfully written!' });
    });
  } catch (err) {
    console.error(`Error streaming file: ${err}`);
    res.status(500).json({ message: `Error streaming file: ${err.message}` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
