import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

const useGetAllPosts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/post/all", {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error(
          "Get all posts error:",
          error.response?.data?.message || error.message,
        );
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [dispatch, user]);
};

export default useGetAllPosts;
