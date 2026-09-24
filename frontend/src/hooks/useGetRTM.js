import { addMessage } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import socket from "@/socket/socket";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const isCurrentConversation =
        newMessage.senderId === userId || newMessage.receiverId === userId;

      if (isCurrentConversation) {
        dispatch(addMessage(newMessage));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [dispatch, userId]);
};

export default useGetRTM;
