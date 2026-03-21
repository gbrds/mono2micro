const express = require('express');
const cors = require('cors');
const postsRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "https://blog.local",
  "https://blog.local:8443",
  "http://blog.local",
  "http://blog.local:8080",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.send('Posts service running');
});

app.get('/events', (req, res) => {
  res.send({ status: 'Event received (GET)' });
})

app.post('/events', (req, res) => {
  res.send({ status: 'Event received (POST)' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Posts service running on 0.0.0.0:${PORT}`);
});