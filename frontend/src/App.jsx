import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser, setCheckingAuth, logout } from "./redux/authSlice";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

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
    // The routes inside children must pass through ProtectedRoute first.
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
            path: "profile/edit",
            element: <EditProfile />,
          },
        ],
      },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();

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

  return <RouterProvider router={browserRouter} />;
}

export default App;
