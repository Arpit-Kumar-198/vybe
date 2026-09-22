import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import Post from "./Post";

const SinglePost = () => {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/post/${postId}`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          setPost(res.data.post);
        }
      } catch (error) {
        console.error("Fetch single post error:", error);
        toast.error(
          error.response?.data?.message || "Failed to load post",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <Post post={post} />
      </div>
    </div>
  );
};

export default SinglePost;