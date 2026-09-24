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

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import Logo from "../components/Logo";
import CreatePost from "./CreatePost";
import Notifications from "@/components/Notifications";

import axios from "axios";
import { toast } from "sonner";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

import {
  setUnreadCount,
  incrementUnreadCount,
} from "../redux/notificationSlice";

import { useEffect, useState } from "react";

import socket from "../socket/socket";

const LeftSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  const { unreadCount } = useSelector((store) => store.notification);

  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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
  ];

  // ================= FETCH UNREAD COUNT =================

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/notification/unread-count",
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setUnreadCount(res.data.count));
        }
      } catch (error) {
        console.error("Fetch unread count error:", error);
      }
    };

    if (user?._id) {
      fetchUnreadCount();
    }
  }, [user?._id, dispatch]);

  // ================= REAL-TIME NOTIFICATIONS =================

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleNewNotification = () => {
      dispatch(incrementUnreadCount());
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [user?._id, dispatch]);

  // ================= LOGOUT =================

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

  // ================= NOTIFICATION BUTTON =================

  const NotificationButton = ({ mobile = false }) => {
    return (
      <button
        type="button"
        onClick={() => setOpenNotifications(true)}
        className={
          mobile
            ? "relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-1 text-gray-700 transition hover:text-black"
            : "my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
        }
      >
        <div className="relative shrink-0">
          <Heart className={mobile ? "h-5 w-5" : "h-6 w-6"} />

          {unreadCount > 0 && (
            <span
              className={
                mobile
                  ? "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                  : "absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
              }
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        <span className={mobile ? "text-[10px] leading-none" : "font-medium"}>
          Notifications
        </span>
      </button>
    );
  };

  return (
    <>
      {/* ================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================= */}

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

            {/* Notifications */}

            <NotificationButton />

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

          {/* Logout */}

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

      {/* ================================================= */}
      {/* MOBILE TOP BAR */}
      {/* ================================================= */}

      {location.pathname !== "/search" && (
        <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-gray-200 bg-white lg:hidden">
          <div className="flex h-full w-full items-center justify-between px-3">
            {/* Search */}

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium transition hover:bg-gray-100 active:bg-gray-100"
            >
              <Search className="h-5 w-5" />

              <span>Search Users</span>
            </button>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-gray-100 active:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {/* ================================================= */}
      {/* MOBILE BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 w-full items-center border-t border-gray-200 bg-white px-1 lg:hidden">
        {/* Home */}

        <Link
          to="/"
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-1 text-gray-700 transition hover:text-black"
        >
          <Home className="h-5 w-5" />

          <span className="text-[10px] leading-none">Home</span>
        </Link>

        {/* Messages */}

        <Link
          to="/chat"
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-1 text-gray-700 transition hover:text-black"
        >
          <MessageCircle className="h-5 w-5" />

          <span className="text-[10px] leading-none">Messages</span>
        </Link>

        {/* Create */}

        <button
          type="button"
          onClick={() => setOpenCreatePost(true)}
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-1 text-gray-700 transition hover:text-black"
        >
          <PlusSquare className="h-5 w-5" />

          <span className="text-[10px] leading-none">Create</span>
        </button>

        {/* Notifications */}

        <NotificationButton mobile />

        {/* Profile */}

        <Link
          to={`/profile/${user?._id}`}
          className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 px-1 text-gray-700 transition hover:text-black"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={user?.profilePicture} alt="Profile" />

            <AvatarFallback>
              {user?.username?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>

          <span className="text-[10px] leading-none">Profile</span>
        </Link>
      </nav>

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      <CreatePost open={openCreatePost} setOpen={setOpenCreatePost} />

      <Notifications
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </>
  );
};

export default LeftSidebar;
