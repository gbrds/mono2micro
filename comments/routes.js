const express = require('express');
const axios = require('axios'); // to call Posts API
const router = express.Router();

let comments = [];

const POSTS_API = 'http://localhost:3001/posts';

// Get comments for a post
router.get('/:postId', async (req, res) => {
    const postId = Number(req.params.postId);

    // Check if post exists via Posts API
    try {
        await axios.get(`${POSTS_API}/${postId}`);
    } catch (err) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const postComments = comments.filter(c => c.postId === postId);
    res.json(postComments);
});

// Add comment to a post
router.post('/:postId', async (req, res) => {
    const postId = Number(req.params.postId);

    // Verify post exists
    try {
        await axios.get(`${POSTS_API}/${postId}`);
    } catch (err) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
        id: Date.now(),
        postId,
        content: req.body.content,
        status: 'pending'
    };
    comments.push(newComment);

    try {
        await axios.post('http://localhost:3003/events', {
            type: 'CommentCreated',
            data: newComment
        })
    } catch (err) {
        console.error('Failed to emit CommentCreated event: ', err.message)
    }

    res.status(201).json(newComment);
});

module.exports = router;