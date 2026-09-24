import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  useEffect(() => {
    if (!userId) {
      dispatch(setMessages([]));
      return;
    }

    const fetchAllMessage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/message/all/${userId}`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.log("Get messages error:", error);
        dispatch(setMessages([]));
      }
    };

    fetchAllMessage();
  }, [userId, dispatch]);
};

export default useGetAllMessage;
