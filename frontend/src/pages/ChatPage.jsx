import React, { useState } from "react";
import { useSelector } from "react-redux";

import ChatUsers from "./ChatUsers";
import useGetChatUsers from "@/hooks/useGetChatUsers";

const ChatPage = () => {
  const [chatUsers, setChatUsers] = useState([]);

  const { selectedUser } = useSelector((store) => store.auth);

  useGetChatUsers(setChatUsers);

  return (
    <div className="ml-0 h-[100dvh] w-full md:ml-[16%] md:w-[84%]">
      <ChatUsers chatUsers={chatUsers} />
    </div>
  );
};

export default ChatPage;
