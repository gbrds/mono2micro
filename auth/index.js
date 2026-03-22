const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5006;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Dummy user
const DUMMY_USER = { id: 1, username: 'admin', password: 'password123' };

// Login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== DUMMY_USER.username || password !== DUMMY_USER.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: DUMMY_USER.id, username: DUMMY_USER.username },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

// Verify
app.get('/auth/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
});

// Refresh
app.post('/auth/refresh', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        const newToken = jwt.sign(
            { id: decoded.id, username: decoded.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token: newToken });
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout
app.post('/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Auth service running on 0.0.0.0:${PORT}`);
});