import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { setPosts } from "@/redux/postSlice";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import Comment from "./Comment";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [comment, setComment] = useState([]);

  const { selectedPost, posts } = useSelector((store) => store.post);

  const dispatch = useDispatch();

  // Load comments whenever selected post changes
  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments || []);
    }
  }, [selectedPost]);

  // Input change
  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  // Add comment
  const sendMessageHandler = async () => {
    const commentText = text.trim();

    if (!commentText || !selectedPost?._id) {
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,
        {
          text: commentText,
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];

        setComment(updatedCommentData);

        // Update post inside Redux
        const updatedPostData = posts.map((post) =>
          post._id === selectedPost._id
            ? {
                ...post,
                comments: updatedCommentData,
              }
            : post,
        );

        dispatch(setPosts(updatedPostData));

        setText("");

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(
        "Comment error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          w-[95vw]
          max-w-5xl
          p-0
          overflow-hidden
        "
      >
        <div className="flex max-h-[90vh] flex-col md:flex-row">
          {/* POST IMAGE */}
          <div className="hidden w-1/2 bg-black md:block">
            <img
              src={selectedPost?.image}
              alt="Post"
              className="h-full max-h-[90vh] w-full object-contain"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex w-full flex-col md:w-1/2">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Link to={`/profile/${selectedPost?.author?._id}`}>
                  <Avatar>
                    <AvatarImage
                      src={selectedPost?.author?.profilePicture}
                      alt={selectedPost?.author?.username || "User"}
                    />

                    <AvatarFallback>
                      {selectedPost?.author?.username
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  to={`/profile/${selectedPost?.author?._id}`}
                  className="text-sm font-semibold"
                >
                  {selectedPost?.author?.username}
                </Link>
              </div>

              {/* MORE OPTIONS */}
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" aria-label="More options">
                    <MoreHorizontal className="cursor-pointer" />
                  </button>
                </DialogTrigger>

                <DialogContent className="w-[90vw] max-w-sm">
                  <div className="flex flex-col items-center text-center text-sm">
                    <button
                      type="button"
                      className="w-full p-3 font-bold text-[#ED4956]"
                    >
                      Unfollow
                    </button>

                    <button type="button" className="w-full p-3">
                      Add to favorites
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <hr />

            {/* COMMENTS */}
            <div className="max-h-96 flex-1 overflow-y-auto p-4">
              {comment.length > 0 ? (
                comment.map((item) => <Comment key={item._id} comment={item} />)
              ) : (
                <div className="flex h-full min-h-32 items-center justify-center text-sm text-gray-500">
                  No comments yet.
                </div>
              )}
            </div>

            <hr />

            {/* ADD COMMENT */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessageHandler();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="
                    min-w-0
                    flex-1
                    rounded
                    border
                    border-gray-300
                    p-2
                    text-sm
                    outline-none
                    focus:border-gray-500
                  "
                />

                <Button
                  type="button"
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="outline"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
