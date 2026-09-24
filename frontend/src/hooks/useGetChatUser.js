import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import { setSelectedUser } from "@/redux/authSlice";

const useGetChatUser = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) {
      dispatch(setSelectedUser(null));
      return;
    }

    const getChatUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setSelectedUser(res.data.user));
        }
      } catch (error) {
        console.error(
          "Get chat user error:",
          error.response?.data?.message || error.message,
        );

        dispatch(setSelectedUser(null));
      }
    };

    getChatUser();
  }, [userId, dispatch]);
};

export default useGetChatUser;
