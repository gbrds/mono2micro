const express = require('express');
const cors = require('cors');
const commentsRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 3002;

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

app.use('/posts', commentsRouter);

app.get('/', (req, res) => {
  res.send('Comments service running');
});

app.post('/events', async (req, res) => {
  res.send({});
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Comments service running on 0.0.0.0:${PORT}`);
});