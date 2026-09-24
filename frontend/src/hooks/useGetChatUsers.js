import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

const useGetChatUsers = (setChatUsers) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/message/users",
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          setChatUsers(res.data.users);
        }
      } catch (error) {
        console.log("Get chat users error:", error);
      }
    };

    fetchChatUsers();
  }, [setChatUsers]);
};

export default useGetChatUsers;
