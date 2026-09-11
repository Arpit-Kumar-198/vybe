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

  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setInput({
        ...input,
        profilePhoto: file,
      });
    }
  };

  const selectChangeHandler = (value) => {
    setInput({
      ...input,
      gender: value,
    });
  };

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
    <div className="mx-auto flex max-w-2xl pl-10">
      <section className="my-8 flex w-full flex-col gap-6">
        <h1 className="text-xl font-bold">Edit Profile</h1>

        <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="Profile" />

              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-sm font-bold">{user?.username}</h1>

              <span className="text-gray-600">
                {user?.bio || "Bio here..."}
              </span>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <Button
            onClick={() => imageRef.current?.click()}
            className="h-8 bg-[#0095F6] hover:bg-[#318bc7]"
          >
            Change photo
          </Button>
        </div>

        <div>
          <h1 className="mb-2 text-xl font-bold">Bio</h1>

          <Textarea
            value={input.bio}
            onChange={(e) =>
              setInput({
                ...input,
                bio: e.target.value,
              })
            }
            name="bio"
            className="focus-visible:ring-transparent"
          />
        </div>

        <div>
          <h1 className="mb-2 font-bold">Gender</h1>

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

        <div className="flex justify-end">
          <Button
            onClick={editProfileHandler}
            disabled={loading}
            className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"
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
