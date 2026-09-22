import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import {
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

import { setSelectedPost } from "@/redux/postSlice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import CommentDialog from "./CommentDialog";

const Post = ({ post }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);

  const [openComments, setOpenComments] = useState(false);
  const [openOptions, setOpenOptions] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  const [loading, setLoading] = useState(false);

  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.some(
      (bookmark) => String(bookmark?._id || bookmark) === String(post?._id),
    ) || false,
  );

  // ---------------- LIKE STATE ----------------

  const [liked, setLiked] = useState(
    post?.likes?.some((id) => String(id?._id || id) === String(user?._id)) ||
      false,
  );

  // Keep like state updated when a different post/user is loaded
  useEffect(() => {
    setLiked(
      post?.likes?.some((id) => String(id?._id || id) === String(user?._id)) ||
        false,
    );
  }, [post, user?._id]);

  const isOwner = String(user?._id) === String(post?.author?._id);

  const postLike = post?.likes?.length || 0;
  const comments = post?.comments || [];

  const isFollowing = user?.following?.some(
    (id) => String(id?._id || id) === String(post?.author?._id),
  );

  // ---------------- COMMENT DIALOG ----------------

  const openCommentDialog = () => {
    dispatch(setSelectedPost(post));
    setOpenComments(true);
  };

  // ---------------- LIKE / DISLIKE ----------------

  const likeOrDislikeHandler = async () => {
    if (!user?._id || loading) return;

    try {
      setLoading(true);

      const action = liked ? "dislike" : "like";

      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/${action}`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        // Immediately update heart icon
        setLiked(!liked);

        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE POST ----------------

  const deletePostHandler = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post._id}`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message || "Post deleted successfully");

        setOpenOptions(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FOLLOW / UNFOLLOW ----------------

  const unfollowHandler = async () => {
    if (loading || !post?.author?._id) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${post.author._id}`,
        {},
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message || "User unfollowed successfully");

        setOpenOptions(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to follow/unfollow user",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SHARE POST ----------------

  const shareOnPlatform = async (platform) => {
    const postUrl = `${window.location.origin}/post/${post._id}`;

    const encodedUrl = encodeURIComponent(postUrl);

    const encodedText = encodeURIComponent(
      post?.caption || "Check out this post on Vybe!",
    );

    let shareUrl = "";

    try {
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;

        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
          break;

        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;

        case "instagram":
          await navigator.clipboard.writeText(postUrl);

          toast.success("Post link copied! Paste it on Instagram.");

          window.open("https://www.instagram.com/", "_blank");

          return;

        default:
          return;
      }

      window.open(shareUrl, "_blank", "width=600,height=500");
    } catch (error) {
      toast.error("Unable to share post");
    }
  };

  // ---------------- BOOKMARK POST ----------------

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/bookmark`,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        setBookmarked(res.data.type === "saved");

        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to bookmark post");
    }
  };

  return (
    <article className="mx-auto my-8 w-full max-w-lg px-2 sm:px-0">
      {/* ==================== POST HEADER ==================== */}

      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Link to={`/profile/${post?.author?._id}`}>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage
                src={post?.author?.profilePicture}
                alt={post?.author?.username || "User"}
              />

              <AvatarFallback>
                {post?.author?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={`/profile/${post?.author?._id}`}
              className="truncate text-sm font-semibold"
            >
              {post?.author?.username}
            </Link>

            {isOwner && <Badge variant="secondary">Author</Badge>}
          </div>
        </div>

        {/* THREE DOT BUTTON */}

        <button
          type="button"
          onClick={() => setOpenOptions(true)}
          className="rounded-full p-1 hover:bg-gray-100"
          aria-label="More options"
        >
          <MoreHorizontal />
        </button>
      </div>

      {/* ==================== OPTIONS DIALOG ==================== */}

      <Dialog open={openOptions} onOpenChange={setOpenOptions}>
        <DialogContent className="w-[90vw] max-w-sm">
          <DialogHeader>
            <DialogTitle>Post Options</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center text-center">
            {isOwner ? (
              <Button
                type="button"
                onClick={deletePostHandler}
                disabled={loading}
                variant="ghost"
                className="w-full font-bold text-red-600"
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full font-bold text-red-600"
                onClick={unfollowHandler}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== POST IMAGE ==================== */}

      <img
        src={post?.image}
        alt={`Post by ${post?.author?.username || "user"}`}
        className="my-2 aspect-square w-full rounded-sm object-cover"
      />

      {/* ==================== ACTION BUTTONS ==================== */}

      <div className="my-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* LIKE */}

          <button
            type="button"
            onClick={likeOrDislikeHandler}
            disabled={loading}
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

          <button
            type="button"
            onClick={() => setOpenShare(true)}
            aria-label="Share post"
          >
            <Send className="h-6 w-6 cursor-pointer hover:text-gray-600" />
          </button>
        </div>

        {/* BOOKMARK */}

        <button
          type="button"
          onClick={bookmarkHandler}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-6 w-6 cursor-pointer" />
          ) : (
            <Bookmark className="h-6 w-6 cursor-pointer hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* ==================== SHARE DIALOG ==================== */}

      <Dialog open={openShare} onOpenChange={setOpenShare}>
        <DialogContent className="w-[90vw] max-w-sm">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4">
            {/* FACEBOOK */}

            <button
              type="button"
              onClick={() => {
                shareOnPlatform("facebook");
                setOpenShare(false);
              }}
              className="flex flex-col items-center gap-2"
            >
              <FaFacebookF size={28} className="text-blue-600" />

              <span className="text-xs">Facebook</span>
            </button>

            {/* WHATSAPP */}

            <button
              type="button"
              onClick={() => {
                shareOnPlatform("whatsapp");
                setOpenShare(false);
              }}
              className="flex flex-col items-center gap-2"
            >
              <FaWhatsapp size={28} className="text-green-500" />

              <span className="text-xs">WhatsApp</span>
            </button>

            {/* TWITTER */}

            <button
              type="button"
              onClick={() => {
                shareOnPlatform("twitter");
                setOpenShare(false);
              }}
              className="flex flex-col items-center gap-2"
            >
              <FaTwitter size={28} className="text-sky-500" />

              <span className="text-xs">Twitter</span>
            </button>

            {/* INSTAGRAM */}

            <button
              type="button"
              onClick={() => {
                shareOnPlatform("instagram");
                setOpenShare(false);
              }}
              className="flex flex-col items-center gap-2"
            >
              <FaInstagram size={28} className="text-pink-500" />

              <span className="text-xs">Instagram</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== LIKES ==================== */}

      <span className="mb-2 block text-sm font-semibold">
        {postLike} {postLike === 1 ? "like" : "likes"}
      </span>

      {/* ==================== CAPTION ==================== */}

      <p className="whitespace-pre-wrap break-words text-sm">
        <span className="mr-2 font-semibold">{post?.author?.username}</span>

        {post?.caption}
      </p>

      {/* ==================== COMMENTS PREVIEW ==================== */}

      {comments.length > 0 && (
        <button
          type="button"
          onClick={openCommentDialog}
          className="mt-1 text-sm text-gray-400 hover:text-gray-600"
        >
          View all {comments.length}{" "}
          {comments.length === 1 ? "comment" : "comments"}
        </button>
      )}

      {/* ==================== COMMENT DIALOG ==================== */}

      <CommentDialog open={openComments} setOpen={setOpenComments} />
    </article>
  );
};

export default Post;
