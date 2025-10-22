const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

// In-memory storage
let posts = [];

// Get all posts with comments
app.get('/posts', (req, res) => {
    console.log('Fetching all posts, total:', posts.length);
    posts.forEach(p => {
        console.log(`Post ${p.id}: "${p.title}" with ${p.comments.length} comments`);
    });
    res.json(posts);
});

// Receive events from Event Bus
app.post('/events', (req, res) => {
    const { type, data } = req.body;
    console.log('Received event:', type, data);

    switch(type) {
        case 'PostCreated':
            posts.push({ ...data, comments: [] });
            console.log(`Added Post ${data.id} to Query service`);
            break;
        case 'CommentCreated':
            const post = posts.find(p => p.id === data.postId);
            if (post) {
                post.comments.push(data);
                console.log(`Added Comment ${data.id} to Post ${data.postId}`);
            } else {
                console.log(`Post ${data.postId} not found in Query service`);
            }
            break;

        case 'CommentModerated':
            const postWithComment = posts.find(p => p.id === data.postId);
            if (postWithComment) {
                const comment = postWithComment.comments.find(c => c.id === data.id);
                if (comment) {
                    comment.status = data.status;
                    console.log(`Comment ${data.id} status updated to ${data.status}`);
                }
            }
            break;
        
        default:
            console.log('Unknown event type:', type);
    }

    res.send({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`Query service running on http://localhost:${PORT}`);
});