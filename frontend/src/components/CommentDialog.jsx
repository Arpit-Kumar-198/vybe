import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Send } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

import { setSelectedPost } from "../redux/postSlice";

const CommentDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const { selectedPost } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const commentsContainerRef = useRef(null);

  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost.comments || []);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const closeDialogHandler = () => {
    setText("");
    setComments([]);

    if (onClose) {
      onClose();
    }

    // Clear selected post if your Redux logic requires it
    dispatch(setSelectedPost(null));
  };

  const sendCommentHandler = async (e) => {
    e.preventDefault();

    if (!text.trim() || loading || !selectedPost) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,
        {
          text: text.trim(),
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const newComment = res.data.comment;

        setComments((prev) => {
          if (prev.some((comment) => comment._id === newComment._id)) {
            return prev;
          }

          return [...prev, newComment];
        });
        setText("");

        dispatch(
          setSelectedPost({
            ...selectedPost,
            comments: [...(selectedPost.comments || []), newComment],
          }),
        );

        toast.success("Comment added");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !selectedPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-4 sm:px-5">
      <div
        className="
          flex h-[90vh] w-full max-w-lg flex-col
          overflow-hidden rounded-xl border bg-background shadow-xl
          sm:h-[80vh]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold sm:text-lg">Comments</h2>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeDialogHandler}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments */}
        <div
          ref={commentsContainerRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {comments.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={comment.author?.profilePicture} />

                  <AvatarFallback>
                    {comment.author?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="rounded-xl bg-muted px-3 py-2">
                    <p className="text-sm font-semibold">
                      {comment.author?.username || "User"}
                    </p>

                    <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-5">
                      {comment.text}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {comment.createdAt &&
                        new Date(comment.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={sendCommentHandler}
          className="border-t bg-background p-3"
        >
          <div className="flex items-end gap-2">
            <Avatar className="hidden h-9 w-9 shrink-0 sm:flex">
              <AvatarImage src={user?.profilePicture} />

              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendCommentHandler(e);
                }
              }}
              placeholder="Write a comment..."
              rows={1}
              maxLength={5000}
              className="
                max-h-28 min-h-10 flex-1 resize-none rounded-xl
                border bg-muted px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-primary
              "
            />

            <Button
              type="submit"
              size="icon"
              disabled={!text.trim() || loading}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentDialog;
