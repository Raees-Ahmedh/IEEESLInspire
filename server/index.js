const express = require('express');
require('dotenv').config(); // Load environment variables from .env file
const app = express();

const PORT = process.env.PORT || 4000;

// Middleware to log requests
app.use((req, res, next) => {
  console.log('path:' + req.path + ' method: ' + req.method);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

