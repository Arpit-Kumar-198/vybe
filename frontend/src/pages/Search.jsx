import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import useSearchUsers from "../hooks/useSearchUsers";

const Search = () => {
  const [query, setQuery] = useState("");
  const { users, loading } = useSearchUsers(query);
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-xl px-3 py-6 sm:px-5 sm:py-8 lg:px-6">
      {/* Heading */}
      <h1 className="mb-5 text-lg font-semibold sm:mb-6 sm:text-xl">Search</h1>

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username..."
          className="h-11 w-full rounded-md bg-gray-100 pl-10 pr-4 text-sm outline-none transition focus:ring-1 focus:ring-gray-300 sm:h-12"
        />
      </div>

      {/* Results */}
      <div className="mt-4 sm:mt-5">
        {loading && <p className="px-1 text-sm text-gray-500">Searching...</p>}

        {!loading && query.trim() && users.length === 0 && (
          <p className="px-1 text-sm text-gray-500">No users found.</p>
        )}

        <div className="space-y-1">
          {users.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => navigate(`/profile/${user._id}`)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-3 text-left transition hover:bg-gray-100 active:bg-gray-100 sm:px-3"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
                <AvatarImage src={user.profilePicture} alt={user.username} />

                <AvatarFallback>
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {/* User information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user.username}
                </p>

                {user.bio && (
                  <p className="truncate text-xs text-gray-500 sm:text-sm">
                    {`@${user.username}`}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
