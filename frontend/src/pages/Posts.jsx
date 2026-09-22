import { useSelector } from "react-redux";

import Post from "@/components/Post";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);

  return (
    <div className="flex w-full flex-col gap-4">
      {posts?.length > 0 ? (
        posts.map((post) => <Post key={post._id} post={post} />)
      ) : (
        <div className="flex min-h-60 items-center justify-center px-4 text-center text-sm text-gray-500">
          No posts available.
        </div>
      )}
    </div>
  );
};

export default Posts;
