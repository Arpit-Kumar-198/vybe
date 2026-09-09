import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MainLayout from "./pages/MainLayout";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser, setCheckingAuth } from "./redux/authSlice";

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
        console.log("User is not logged in");
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };

    getCurrentUser();
  }, [dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
