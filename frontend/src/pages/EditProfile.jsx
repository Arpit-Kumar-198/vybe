import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = () => {
  const imageRef = useRef();

  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(user?.profilePicture || "");

  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle profile image selection
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setInput({
      ...input,
      profilePhoto: file,
    });

    // Show selected image immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Handle gender selection
  const selectChangeHandler = (value) => {
    setInput({
      ...input,
      gender: value,
    });
  };

  // Submit profile changes
  const editProfileHandler = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("bio", input.bio);
      formData.append("gender", input.gender);

      if (input.profilePhoto) {
        formData.append("profilePhoto", input.profilePhoto);
      }

      const res = await axios.post(
        "http://localhost:8000/api/v1/user/profile/edit",
        formData,
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender,
        };

        dispatch(setAuthUser(updatedUserData));

        toast.success(res.data.message);

        navigate(`/profile/${user?._id}`);
      }
    } catch (error) {
      console.error(
        "Edit profile error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Heading */}
        <h1 className="text-xl font-bold sm:text-2xl">Edit Profile</h1>

        {/* Profile information */}
        <div className="flex flex-col gap-4 rounded-xl bg-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          {/* User information */}
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <AvatarImage src={imagePreview} alt="Profile" />

              <AvatarFallback className="text-lg sm:text-xl">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold sm:text-base">
                {user?.username}
              </h1>

              <span className="block truncate text-sm text-gray-600">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            accept="image/*"
            className="hidden"
          />

          {/* Change photo button */}
          <Button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="w-full shrink-0 bg-[#0095F6] hover:bg-[#318bc7] sm:w-auto"
          >
            Change photo
          </Button>
        </div>

        {/* Bio */}
        <div>
          <h1 className="mb-2 text-lg font-bold sm:text-xl">Bio</h1>

          <Textarea
            value={input.bio}
            onChange={(e) =>
              setInput({
                ...input,
                bio: e.target.value,
              })
            }
            name="bio"
            placeholder="Write something about yourself..."
            className="min-h-28 resize-none focus-visible:ring-transparent"
          />
        </div>

        {/* Gender */}
        <div>
          <h1 className="mb-2 text-lg font-bold">Gender</h1>

          <Select value={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={editProfileHandler}
            disabled={loading}
            className="w-full bg-[#0095F6] hover:bg-[#2a8ccd] sm:w-fit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
