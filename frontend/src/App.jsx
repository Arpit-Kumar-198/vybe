import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import Home from "./pages/Home";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SinglePost from "./components/SinglePost";
import { setAuthUser, setCheckingAuth, logout } from "./redux/authSlice";

import socket from "@/socket/socket";
import {
  updatePostLikes,
  addCommentToPost,
  removePost,
} from "./redux/postSlice";

const browserRouter = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
          {
            path: "/profile/edit",
            element: <EditProfile />,
          },
          {
            path: "post/:postId",
            element: <SinglePost />,
          },
        ],
      },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  // 1. Check current logged-in user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/user/me", {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setAuthUser(res.data.user));
        }
      } catch (error) {
        dispatch(logout());
        console.log("User is not logged in");
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };

    getCurrentUser();

    const handlePageShow = () => {
      getCurrentUser();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [dispatch]);

  // 2. Connect Socket.IO after user login
  useEffect(() => {
    if (!user?._id) return;

    socket.io.opts.query = {
      userId: user._id,
    };

    socket.connect();

    console.log("Socket connected for user:", user._id);

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [user?._id]);

  // Listen for real-time post updates
  useEffect(() => {
    // When someone likes a post
    const handlePostLiked = (data) => {
      dispatch(updatePostLikes(data));
    };

    // When someone dislikes a post
    const handlePostDisliked = (data) => {
      dispatch(updatePostLikes(data));
    };

    // When someone adds a comment
    const handlePostCommented = (data) => {
      dispatch(addCommentToPost(data));
    };

    // When someone deletes a post
    const handlePostDeleted = (data) => {
      dispatch(removePost(data));
    };

    socket.on("post:liked", handlePostLiked);
    socket.on("post:disliked", handlePostDisliked);
    socket.on("post:commented", handlePostCommented);
    socket.on("post:deleted", handlePostDeleted);

    // Remove listeners when component is removed
    return () => {
      socket.off("post:liked", handlePostLiked);
      socket.off("post:disliked", handlePostDisliked);
      socket.off("post:commented", handlePostCommented);
      socket.off("post:deleted", handlePostDeleted);
    };
  }, [dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
