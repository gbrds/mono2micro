const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3005; // pick a free port

app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const status = data.content.toLowerCase().includes('orange')
            ? 'rejected'
            : 'approved';

        const moderatedComment = { ...data, status };

        try {
            await axios.post('http://localhost:3003/events', {
                type: 'CommentModerated',
                data: moderatedComment
            });
            console.log(`Comment ${data.id} moderated: ${status}`);
        } catch (err) {
            console.error('Failed to emit CommentModerated event:', err.message);
        }
    }

    res.send({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`Moderation service listening on http://localhost:${PORT}`);
});