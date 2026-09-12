import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { setPosts } from "@/redux/postSlice";
import { readFileAsDataURL } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);

  const dispatch = useDispatch();

  // Select image
  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // Optional: prevent very large files
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);

    const dataUrl = await readFileAsDataURL(selectedFile);
    setImagePreview(dataUrl);
  };

  // Create post
  const createPostHandler = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("caption", caption);
      formData.append("image", file);

      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));

        toast.success(res.data.message);

        resetForm();

        setOpen(false);
      }
    } catch (error) {
      console.error(
        "Error creating post:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCaption("");
    setFile(null);
    setImagePreview("");

    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  // Handle dialog close
  const handleOpenChange = (value) => {
    if (loading) {
      return;
    }

    if (!value) {
      resetForm();
    }

    setOpen(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-lg
          max-h-[90vh]
          overflow-y-auto
          rounded-xl
          p-4
          sm:p-6
        "
      >
        {/* Header */}
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-lg font-semibold sm:text-xl">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        {/* User information */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
            <AvatarImage
              src={user?.profilePicture}
              alt={user?.username || "Profile"}
            />

            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold sm:text-base">
              {user?.username || "User"}
            </h2>

            <p className="truncate text-xs text-gray-500 sm:text-sm">
              {"Share your thoughts..."}
            </p>
          </div>
        </div>

        {/* Caption */}
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={loading}
          placeholder="Write a caption..."
          className="
            min-h-24
            resize-none
            border-none
            px-0
            text-sm
            shadow-none
            focus-visible:ring-0
            sm:text-base
          "
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="flex w-full items-center justify-center overflow-hidden rounded-lg bg-black">
            <img
              src={imagePreview}
              alt="Selected post preview"
              className="
                max-h-[45vh]
                w-full
                object-contain
                sm:max-h-[50vh]
              "
            />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={fileChangeHandler}
          disabled={loading}
        />

        {/* Select image button */}
        <Button
          type="button"
          onClick={() => imageRef.current?.click()}
          disabled={loading}
          className="
            mx-auto
            w-full
            max-w-xs
            bg-[#0095F6]
            hover:bg-[#258bcf]
            sm:w-fit
          "
        >
          <ImagePlus className="mr-2 h-4 w-4" />

          {imagePreview ? "Change image" : "Select image"}
        </Button>

        {/* Post button */}
        {imagePreview && (
          <Button
            type="button"
            onClick={createPostHandler}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
