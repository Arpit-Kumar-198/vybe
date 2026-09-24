import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import { setSelectedUser } from "@/redux/authSlice";

const ChatUsers = ({ chatUsers }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { onlineUsers } = useSelector((store) => store.chat);

  const handleUserClick = (chatUser) => {
    dispatch(setSelectedUser(chatUser));

    navigate(`/chat/${chatUser._id}`);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b px-4 py-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chatUsers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            No conversations yet.
          </p>
        ) : (
          chatUsers.map((chatUser) => {
            const isOnline = onlineUsers.includes(chatUser?._id);

            return (
              <button
                key={chatUser._id}
                type="button"
                onClick={() => handleUserClick(chatUser)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={chatUser?.profilePicture}
                      alt={chatUser?.username}
                    />

                    <AvatarFallback>
                      {chatUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {chatUser?.username}
                  </p>

                  <p
                    className={`text-xs ${
                      isOnline ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatUsers;
