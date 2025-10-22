const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/events', async (req, res) => {
  const event = req.body;

  // Send the event to other services
  try {
    await axios.post('http://localhost:3001/events', event); // Posts
    await axios.post('http://localhost:3002/events', event); // Comments
    await axios.post('http://localhost:3004/events', event); // Query
    // Add others later
  } catch (err) {
    console.log('Error forwarding event:', err.message);
  }

  res.send({ status: 'OK' });
});

app.listen(3003, () => {
  console.log('Event bus listening on 3003');
});