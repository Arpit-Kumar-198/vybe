import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const SuggestedUsers = () => {
  const suggestedUsers = null;

  const followHandler = async (userId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const updatedUsers = suggestedUsers.filter(
          (suggestedUser) => suggestedUser._id !== userId,
        );
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(
        "Follow error:",
        error.response?.data?.message || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to follow user");
    }
  };

  return (
    <div className="my-8">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <h2 className="font-semibold text-gray-500">Suggested for you</h2>

        <button type="button" className="font-medium hover:text-gray-500">
          See All
        </button>
      </div>

      {/* Users */}
      <div className="mt-5 space-y-5">
        {suggestedUsers?.length > 0 ? (
          suggestedUsers.map((suggestedUser) => (
            <div
              key={suggestedUser?._id}
              className="flex items-center justify-between gap-3"
            >
              {/* User info */}
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  to={`/profile/${suggestedUser?._id}`}
                  className="shrink-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={suggestedUser?.profilePicture}
                      alt={suggestedUser?.username || "User"}
                    />

                    <AvatarFallback>
                      {suggestedUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    <Link to={`/profile/${suggestedUser?._id}`}>
                      {suggestedUser?.username}
                    </Link>
                  </h3>

                  <p className="truncate text-sm text-gray-500">
                    {suggestedUser?.bio || "Bio here..."}
                  </p>
                </div>
              </div>

              {/* Follow */}
              <button
                type="button"
                onClick={() => followHandler(suggestedUser._id)}
                className="shrink-0 text-xs font-bold text-[#3BADF8] hover:text-[#3495d6]"
              >
                Follow
              </button>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-gray-500">
            No suggestions available.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;
