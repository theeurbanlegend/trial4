import React, { useContext, useEffect, useState } from 'react';
import Post from './Post';
import { sidebarContext } from './Home';
import Loader from './spinners/Loader';

const Posts = () => {
  //const url='https://api-brosforlyf.onrender.com'
  const url='https://api-brosforlyf.onrender.com'
  const id=localStorage.getItem('id')
  const [obtainedPosts, setObtainedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {selectedCategory}=useContext(sidebarContext)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching posts");
        const response = await fetch(`${url}/api/post/posts`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const updated=data.map((post) => {
          return {
            ...post,
            liked:post.likes.includes(id)
          };
        })
        // Filter posts based on the selected category
        const filteredPosts = updated.filter((post) => post.category === selectedCategory);
        setObtainedPosts(filteredPosts);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="posts-container">
      {loading && (
        <>
      <p>Fetching posts...</p>
      <Loader/>
      </>
      )}
      {!loading && obtainedPosts.length === 0 && <p>No posts yet.</p>}
      {!loading && obtainedPosts.map((post) => (
        <Post
          key={post._id}
          id={post._id}
          vidId={post._id}
          datePosted={post.createdAt}
          posterId={post.poster}
          subjectSummary={post.postSummary}
          imageUrl={post.file}
          likes={post.likes.length}
          liked={post.liked}
        />
      ))}
    </div>
  );
};

export default Posts;
