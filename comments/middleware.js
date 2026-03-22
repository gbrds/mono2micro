const axios = require('axios');

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const response = await axios.get('http://auth-srv:5006/auth/verify', {
            headers: { authorization: authHeader }
        });
        if (response.data.valid) {
            next();
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        res.status(401).json({ error: 'Auth service error' });
    }
};

module.exports = { requireAuth };