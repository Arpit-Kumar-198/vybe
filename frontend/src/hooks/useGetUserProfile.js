import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import { setUserProfile } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const getUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.error(
          "Get profile error:",
          error.response?.data?.message || error.message,
        );
      }
    };

    getUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
