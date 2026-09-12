import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AtSign, Heart, MessageCircle, X } from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
} from "react-icons/fa";

import useGetUserProfile from "@/hooks/useGetUserProfile.js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { id: userId } = useParams();

  const [activeTab, setActiveTab] = useState("posts");
  const [showShareOptions, setShowShareOptions] = useState(false);

  const { user, userProfile } = useSelector((store) => store.auth);

  useGetUserProfile(userId);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  // Follow functionality will be connected later.
  const isFollowing = false;

  const displayedPosts =
    activeTab === "posts"
      ? userProfile?.posts || []
      : userProfile?.bookmarks || [];

  // Share profile
  const handleShare = (platform) => {
    const profileUrl = window.location.href;
    const username = userProfile?.username || "Profile";
    const shareText = `Check out @${username}'s profile on Vybe`;

    if (platform === "instagram") {
      navigator.clipboard
        .writeText(profileUrl)
        .then(() => {
          window.open("https://www.instagram.com/", "_blank");
        })
        .catch(() => {
          window.open("https://www.instagram.com/", "_blank");
        });
    }

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          profileUrl,
        )}`,
        "_blank",
        "width=600,height=500",
      );
    }

    if (platform === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `${shareText} ${profileUrl}`,
        )}`,
        "_blank",
      );
    }

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText,
        )}&url=${encodeURIComponent(profileUrl)}`,
        "_blank",
        "width=600,height=500",
      );
    }

    setShowShareOptions(false);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="mx-auto w-full max-w-5xl px-3 pb-20 pt-20 sm:px-5 sm:pb-8 sm:pt-6 md:px-8">
        {/* =====================================================
            MOBILE PROFILE HEADER
            ===================================================== */}
        <section className="sm:hidden">
          {/* IMAGE + USERNAME + BUTTONS */}
          <div className="flex items-start gap-5">
            {/* PROFILE IMAGE */}
            <div className="shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={userProfile?.profilePicture}
                  alt={userProfile?.username || "Profile"}
                />

                <AvatarFallback className="text-xl">
                  {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* RIGHT SIDE */}
            <div className="min-w-0 flex-1">
              {/* USERNAME */}
              <h1 className="mb-3 truncate text-lg font-semibold">
                {userProfile?.username}
              </h1>

              {/* BUTTONS */}
              {isLoggedInUserProfile ? (
                <div className="flex gap-2">
                  <Link to="/profile/edit" className="min-w-0 flex-1">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 w-full px-2 text-xs sm:text-sm"
                    >
                      Edit profile
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 min-w-0 flex-1 px-2 text-xs sm:text-sm"
                    onClick={() => setShowShareOptions(true)}
                  >
                    Share
                  </Button>
                </div>
              ) : isFollowing ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 flex-1 px-2 text-xs"
                  >
                    Following
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 flex-1 px-2 text-xs"
                  >
                    Message
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 flex-1 px-2 text-xs"
                    onClick={() => setShowShareOptions(true)}
                  >
                    Share
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="h-9 flex-1 bg-[#0095F6] px-2 text-xs hover:bg-[#3192d2]"
                  >
                    Follow
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 flex-1 px-2 text-xs"
                    onClick={() => setShowShareOptions(true)}
                  >
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* USERNAME + BIO */}
          <div className="mt-4">
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">@{userProfile?.username}</span>

              <span className="break-words">
                {userProfile?.bio || "Bio here..."}
              </span>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-5 grid grid-cols-3 border-y border-gray-100 py-3">
            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {userProfile?.posts?.length || 0}
              </span>

              <span className="text-xs text-gray-500">posts</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {userProfile?.followers?.length || 0}
              </span>

              <span className="text-xs text-gray-500">followers</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {userProfile?.following?.length || 0}
              </span>

              <span className="text-xs text-gray-500">following</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESKTOP PROFILE HEADER
            ===================================================== */}
        <section className="hidden sm:block">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 md:gap-12">
            {/* PROFILE IMAGE */}
            <div className="flex shrink-0 justify-center sm:w-1/3">
              <Avatar className="h-28 w-28 md:h-32 md:w-32">
                <AvatarImage
                  src={userProfile?.profilePicture}
                  alt={userProfile?.username || "Profile"}
                />

                <AvatarFallback>
                  {userProfile?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* PROFILE DETAILS */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-5">
                {/* USERNAME + BUTTONS */}
                <div className="flex flex-col gap-3">
                  <h1 className="break-words text-2xl font-semibold">
                    {userProfile?.username}
                  </h1>

                  {isLoggedInUserProfile ? (
                    <div className="flex flex-wrap gap-2">
                      <Link to="/profile/edit">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 px-4 text-sm"
                        >
                          Edit profile
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-4 text-sm"
                        onClick={() => setShowShareOptions(true)}
                      >
                        Share
                      </Button>
                    </div>
                  ) : isFollowing ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-4 text-sm"
                      >
                        Following
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-4 text-sm"
                      >
                        Message
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-4 text-sm"
                        onClick={() => setShowShareOptions(true)}
                      >
                        Share
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="h-9 bg-[#0095F6] px-5 hover:bg-[#3192d2]"
                      >
                        Follow
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 px-5 text-sm"
                        onClick={() => setShowShareOptions(true)}
                      >
                        Share
                      </Button>
                    </div>
                  )}
                </div>

                {/* STATS */}
                <div className="flex items-center gap-8 text-sm">
                  <p>
                    <span className="font-semibold">
                      {userProfile?.posts?.length || 0}
                    </span>{" "}
                    posts
                  </p>

                  <p>
                    <span className="font-semibold">
                      {userProfile?.followers?.length || 0}
                    </span>{" "}
                    followers
                  </p>

                  <p>
                    <span className="font-semibold">
                      {userProfile?.following?.length || 0}
                    </span>{" "}
                    following
                  </p>
                </div>

                {/* BIO */}
                <div className="flex flex-col gap-2 text-sm">
                  <span className="break-words font-semibold">
                    {userProfile?.bio || "Bio here..."}
                  </span>

                  <Badge variant="secondary" className="w-fit">
                    <AtSign className="mr-1 h-4 w-4" />

                    <span className="max-w-[200px] truncate">
                      {userProfile?.username}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TABS
            ===================================================== */}
        <section className="mt-8 border-t border-gray-200 sm:mt-10">
          <div className="grid grid-cols-4 text-xs font-medium sm:text-sm">
            {/* POSTS */}
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`border-t-2 py-3 ${
                activeTab === "posts"
                  ? "border-black font-bold"
                  : "border-transparent text-gray-500"
              }`}
            >
              POSTS
            </button>

            {/* SAVED */}
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`border-t-2 py-3 ${
                activeTab === "saved"
                  ? "border-black font-bold"
                  : "border-transparent text-gray-500"
              }`}
            >
              SAVED
            </button>
          </div>

          {/* POST GRID */}
          {displayedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
              {displayedPosts.map((post) => (
                <div
                  key={post?._id}
                  className="group relative aspect-square cursor-pointer overflow-hidden"
                >
                  <img
                    src={post?.image}
                    alt="Post"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* HOVER INFO */}
                  <div className="absolute inset-0 hidden items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:flex group-hover:opacity-100 sm:flex">
                    <div className="flex items-center gap-3 text-xs font-semibold text-white sm:gap-6 sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 fill-white sm:h-5 sm:w-5" />
                        {post?.likes?.length || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 fill-white sm:h-5 sm:w-5" />
                        {post?.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-gray-500">
              {activeTab === "posts" ? "No posts yet." : "No saved posts yet."}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          PROFESSIONAL SHARE MODAL
          ===================================================== */}
      {showShareOptions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]"
          onClick={() => setShowShareOptions(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-base font-semibold sm:text-lg">
                Share profile
              </h2>

              <button
                type="button"
                onClick={() => setShowShareOptions(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SHARE OPTIONS */}
            <div className="grid grid-cols-4 gap-3 px-5 py-6 sm:gap-5">
              {/* INSTAGRAM */}
              <button
                type="button"
                onClick={() => handleShare("instagram")}
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition group-hover:scale-105 group-hover:bg-gray-200 sm:h-16 sm:w-16">
                  <FaInstagram className="h-7 w-7 text-[#E4405F] sm:h-8 sm:w-8" />
                </div>

                <span className="text-xs font-medium sm:text-sm">
                  Instagram
                </span>
              </button>

              {/* FACEBOOK */}
              <button
                type="button"
                onClick={() => handleShare("facebook")}
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition group-hover:scale-105 group-hover:bg-gray-200 sm:h-16 sm:w-16">
                  <FaFacebookF className="h-6 w-6 text-[#1877F2] sm:h-7 sm:w-7" />
                </div>

                <span className="text-xs font-medium sm:text-sm">Facebook</span>
              </button>

              {/* WHATSAPP */}
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition group-hover:scale-105 group-hover:bg-gray-200 sm:h-16 sm:w-16">
                  <FaWhatsapp className="h-7 w-7 text-[#25D366] sm:h-8 sm:w-8" />
                </div>

                <span className="text-xs font-medium sm:text-sm">WhatsApp</span>
              </button>

              {/* TWITTER */}
              <button
                type="button"
                onClick={() => handleShare("twitter")}
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition group-hover:scale-105 group-hover:bg-gray-200 sm:h-16 sm:w-16">
                  <FaTwitter className="h-7 w-7 text-[#1DA1F2] sm:h-8 sm:w-8" />
                </div>

                <span className="text-xs font-medium sm:text-sm">Twitter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
