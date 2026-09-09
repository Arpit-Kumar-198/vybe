import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import SuggestedUsers from "./SuggestedUsers";

const RightSidebar = () => {
  const user = null;
  return (
    <aside className="w-full px-6 py-8">
      {/* Current user */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user?.profilePicture}
              alt={user?.username || "Profile"}
            />

            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>

          <p className="truncate text-sm text-gray-500">
            {user?.bio || "Bio here..."}
          </p>
        </div>
      </div>

      {/* Suggested users */}
      <SuggestedUsers />
    </aside>
  );
};

export default RightSidebar;
