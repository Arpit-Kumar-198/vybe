import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Logo from "../components/Logo";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { useSelector } from "react-redux";

const LeftSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sidebarItems = [
    {
      icon: <Home />,
      text: "Home",
      path: "/",
    },
    {
      icon: <Search />,
      text: "Search",
      path: "/search",
    },
    {
      icon: <TrendingUp />,
      text: "Explore",
      path: "/",
    },
    {
      icon: <MessageCircle />,
      text: "Messages",
      path: "/chat",
    },
    {
      icon: <Heart />,
      text: "Notifications",
      path: "/notifications",
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/logout", {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(logout());
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };
  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col px-4">
          {/* Logo */}
          <div className="my-8 px-3">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.text}
                to={item.path}
                className="my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-gray-100"
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="font-medium">{item.text}</span>
              </Link>
            ))}

            {/* Create */}
            <button
              type="button"
              onClick={() => setOpenCreatePost(true)}
              className="my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
            >
              <PlusSquare className="shrink-0" />
              <span className="font-medium">Create</span>
            </button>

            {/* Profile */}
            <Link
              to={`/profile/${user?._id}`}
              className="my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-gray-100"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.profilePicture} alt="Profile" />
                <AvatarFallback>
                  {user?.username?.charAt(0)?.toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>

              <span className="font-medium">Profile</span>
            </Link>
          </nav>

          {/* Desktop Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mb-6 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
          >
            <LogOut className="shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE TOP BAR ================= */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white px-3 py-3 sm:px-4 lg:hidden">
        <div className="flex w-full items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              placeholder="Search username..."
              className="h-10 w-full rounded-lg bg-gray-100 pl-10 pr-3 text-sm outline-none focus:ring-1 focus:ring-gray-300 sm:h-11"
            />
          </div>

          {/* Mobile Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition hover:bg-gray-100 sm:h-11 sm:w-11"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex w-full items-center border-t border-gray-200 bg-white px-1 py-1.5 sm:px-2 sm:py-2 lg:hidden">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Home className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[10px] sm:text-xs">Home</span>
        </Link>

        {/* Messages */}
        <Link
          to="/chat"
          className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[10px] sm:text-xs">Messages</span>
        </Link>

        {/* Create */}
        <button
          type="button"
          onClick={() => setOpenCreatePost(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <PlusSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[10px] sm:text-xs">Create</span>
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[10px] sm:text-xs">Notifications</span>
        </Link>

        {/* Profile */}
        <Link
          to={`/profile/${user?._id}`}
          className="flex flex-1 flex-col items-center justify-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
            <AvatarImage src={user?.profilePicture} alt="Profile" />

            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>

          <span className="text-[10px] sm:text-xs">Profile</span>
        </Link>
      </nav>
      <CreatePost open={openCreatePost} setOpen={setOpenCreatePost} />
    </>
  );
};

export default LeftSidebar;
