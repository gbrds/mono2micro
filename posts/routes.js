const express = require('express');
const router = express.Router();
const axios = require('axios')

let posts = [];

router.get('/', (req, res) => res.json(posts));

router.post('/', async (req, res) => {
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content
    };
    posts.push(newPost);
    try {
        await axios.post('http://localhost:3003/events', {
            type: 'PostCreated',
            data: newPost
        });
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error emitting PostCreated event:', err.message);
        res.status(500).json({ error: 'Failed to emit event' });
    }
})

router.get('/:id', (req, res) => {
    const postId = Number(req.params.id);
    const post = posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});

module.exports = router;