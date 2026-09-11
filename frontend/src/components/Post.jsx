import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { setPosts, setSelectedPost } from "@/redux/postSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import CommentDialog from "./CommentDialog";

const Post = ({ post }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);

  const [postLike, setPostLike] = useState(post?.likes?.length || 0);

  const [comment, setComment] = useState(post?.comments || []);

  // ---------------- COMMENT INPUT ----------------

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  // ---------------- OPEN COMMENT DIALOG ----------------

  const openCommentDialog = () => {
    dispatch(setSelectedPost(post));
    setOpen(true);
  };

  // ---------------- LIKE / DISLIKE ----------------

  const likeOrDislikeHandler = async () => {
    if (!user?._id) return;

    try {
      const action = liked ? "dislike" : "like";

      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/${action}`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;

        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((postItem) =>
          postItem._id === post._id
            ? {
                ...postItem,
                likes: liked
                  ? postItem.likes.filter((id) => id !== user._id)
                  : [...postItem.likes, user._id],
              }
            : postItem,
        );

        dispatch(setPosts(updatedPostData));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(
        "Like/dislike error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to update like");
    }
  };

  // ---------------- ADD COMMENT ----------------

  const commentHandler = async () => {
    const commentText = text.trim();

    if (!commentText) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
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

        const updatedPostData = posts.map((postItem) =>
          postItem._id === post._id
            ? {
                ...postItem,
                comments: updatedCommentData,
              }
            : postItem,
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

  // ---------------- DELETE POST ----------------

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post._id}`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem._id !== post._id,
        );

        dispatch(setPosts(updatedPostData));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(
        "Delete post error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  // ---------------- BOOKMARK ----------------

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/bookmark`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(
        "Bookmark error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to bookmark post");
    }
  };

  return (
    <article className="mx-auto my-8 w-full max-w-lg px-2 sm:px-0">
      {/* POST HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage
              src={post?.author?.profilePicture}
              alt={post?.author?.username || "User"}
            />

            <AvatarFallback>
              {post?.author?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-sm font-semibold">
              {post?.author?.username}
            </h1>

            {user?._id === post?.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>

        {/* MORE OPTIONS */}
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                className="rounded-full p-1 hover:bg-gray-100"
                aria-label="More options"
              >
                <MoreHorizontal />
              </button>
            }
          />

          <DialogContent className="w-[90vw] max-w-sm">
            <div className="flex flex-col items-center gap-1 text-center text-sm">
              {post?.author?._id !== user?._id && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full font-bold text-[#ED4956]"
                >
                  Unfollow
                </Button>
              )}

              <Button type="button" variant="ghost" className="w-full">
                Add to favorites
              </Button>

              {user?._id === post?.author?._id && (
                <Button
                  type="button"
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="w-full"
                >
                  Delete
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* POST IMAGE */}
      <img
        src={post?.image}
        alt={`Post by ${post?.author?.username || "user"}`}
        className="my-2 aspect-square w-full rounded-sm object-cover"
      />

      {/* ACTION BUTTONS */}
      <div className="my-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* LIKE */}
          <button
            type="button"
            onClick={likeOrDislikeHandler}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            {liked ? (
              <FaHeart size={23} className="cursor-pointer text-red-600" />
            ) : (
              <FaRegHeart
                size={23}
                className="cursor-pointer hover:text-gray-600"
              />
            )}
          </button>

          {/* COMMENT */}
          <button
            type="button"
            onClick={openCommentDialog}
            aria-label="Comment on post"
          >
            <MessageCircle className="h-6 w-6 cursor-pointer hover:text-gray-600" />
          </button>

          {/* SHARE */}
          <button type="button" aria-label="Share post">
            <Send className="h-6 w-6 cursor-pointer hover:text-gray-600" />
          </button>
        </div>

        {/* BOOKMARK */}
        <button
          type="button"
          onClick={bookmarkHandler}
          aria-label="Bookmark post"
        >
          <Bookmark className="h-6 w-6 cursor-pointer hover:text-gray-600" />
        </button>
      </div>

      {/* LIKES */}
      <span className="mb-2 block text-sm font-semibold">
        {postLike} {postLike === 1 ? "like" : "likes"}
      </span>

      {/* CAPTION */}
      <p className="break-words text-sm">
        <span className="mr-2 font-semibold">{post?.author?.username}</span>

        {post?.caption}
      </p>

      {/* COMMENTS */}
      {comment.length > 0 && (
        <button
          type="button"
          onClick={openCommentDialog}
          className="mt-1 text-sm text-gray-400 hover:text-gray-600"
        >
          View all {comment.length}{" "}
          {comment.length === 1 ? "comment" : "comments"}
        </button>
      )}

      {/* COMMENT DIALOG */}
      <CommentDialog open={open} setOpen={setOpen} />

      {/* ADD COMMENT */}
      <div className="mt-3 flex items-center gap-2 border-t pt-3">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commentHandler();
            }
          }}
          className="min-w-0 flex-1 text-sm outline-none"
        />

        {text.trim() && (
          <button
            type="button"
            onClick={commentHandler}
            className="shrink-0 text-sm font-semibold text-[#3BADF8] hover:text-[#258bcf]"
          >
            Post
          </button>
        )}
      </div>
    </article>
  );
};

export default Post;
