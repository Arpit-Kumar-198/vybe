import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import { setMessages } from "@/redux/chatSlice";

import Messages from "./Messages";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetChatUser from "@/hooks/useGetChatUser";

const ChatConversation = () => {
  const [textMessage, setTextMessage] = useState("");

  const { userId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useGetChatUser(userId);
  useGetAllMessage();

  const { selectedUser } = useSelector((store) => store.auth);

  const { onlineUsers, messages } = useSelector((store) => store.chat);

  const sendMessageHandler = async () => {
    if (!textMessage.trim() || !selectedUser?._id) {
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/message/send/${selectedUser._id}`,
        {
          textMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));

        setTextMessage("");
      }
    } catch (error) {
      console.log("Send message error:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessageHandler();
    }
  };

  const handleBack = () => {
    navigate("/chat");
  };

  if (!selectedUser) {
    return (
      <div className="flex min-h-[calc(100dvh-7rem)] items-center justify-center px-4">
        <p className="text-center text-sm text-gray-500">
          Loading conversation...
        </p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div
      className="
        flex
        min-h-[calc(100dvh-7rem)]
        w-full
        flex-col
        overflow-hidden
        bg-white
        md:ml-[16%]
        md:min-h-screen
        md:w-[84%]
      "
    >
      {/* ================= HEADER ================= */}

      <header
        className="
          flex
          h-16
          shrink-0
          items-center
          gap-3
          border-b
          bg-white
          px-3
          sm:px-5
        "
      >
        <button
          type="button"
          onClick={handleBack}
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            transition
            hover:bg-gray-100
            active:bg-gray-100
          "
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={selectedUser?.profilePicture}
            alt={selectedUser?.username}
          />

          <AvatarFallback>
            {selectedUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">
            {selectedUser?.username}
          </p>

          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />

            <p
              className={`text-xs ${
                isOnline ? "text-green-600" : "text-gray-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </header>

      {/* ================= MESSAGES ================= */}

      <div className="min-h-0 flex-1">
        <Messages selectedUser={selectedUser} />
      </div>

      {/* ================= MESSAGE INPUT ================= */}

      <div
        className="
          shrink-0
          border-t
          bg-white
          px-3
          py-3
          sm:px-5
          sm:py-4
        "
      >
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
          <Input
            value={textMessage}
            onChange={(event) => setTextMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Type a message..."
            className="
              h-11
              min-w-0
              flex-1
              rounded-full
              bg-gray-100
              px-4
              text-sm
              shadow-none
              focus-visible:ring-1
              focus-visible:ring-gray-300
            "
          />

          <Button
            type="button"
            onClick={sendMessageHandler}
            disabled={!textMessage.trim()}
            className="
              h-11
              w-11
              shrink-0
              rounded-full
              p-0
            "
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
