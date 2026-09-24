import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessage();

  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <span>{selectedUser?.username}</span>

          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="my-2 h-8" variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {messages?.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderId === user?._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs break-words rounded-lg p-2 ${
                msg.senderId === user?._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
