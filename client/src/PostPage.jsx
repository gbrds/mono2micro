import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetch(`http://localhost:3004/posts`)
            .then(res => res.json())
            .then(posts => {
                const postData = posts.find(p => p.id === Number(id));
                setPost(postData);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`http://localhost:3002/comments/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: comment })
        });

        if (res.ok) {
            const newComment = await res.json();
            setPost({
                ...post,
                comments: [...(post.comments || []), newComment]
            });
            setComment('');
        }
    };

    if (!post) return <p>Loading...</p>;

    return (
        <div className="formBox">
            <h2>{post.title}</h2>
            <p>{post.content}</p>

            <h3>Comments</h3>
            {post.comments?.length ? (
                post.comments.map(c => <p key={c.id}>
                    {c.status === 'pending' && '[Pending] '}
                    {c.status === 'rejected' && '[Rejected] '}
                    {c.status === 'approved' && ''}
                    {c.content}
                    </p>)
            ) : (
                <p>No Comments yet</p>
            )}

            <h4>Add Comment</h4>
            <form onSubmit={handleSubmit}>
                <input 
                    type='text'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <button type="submit">Add</button>
            </form>
        </div>
    );
}