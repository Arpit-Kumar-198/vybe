import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import Logo from "../components/Logo";

const LeftSidebar = () => {
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
      path: "/explore",
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

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col px-4">
          {/* Logo */}
          <div className="my-8 px-3">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            {/* Home, Search, Explore, Messages, Notifications */}
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
              className="my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
            >
              <PlusSquare className="shrink-0" />

              <span className="font-medium">Create</span>
            </button>

            {/* Profile */}
            <Link
              to="/profile"
              className="my-1 flex w-full items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-gray-100"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>

              <span className="font-medium">Profile</span>
            </Link>
          </nav>

          {/* Logout */}
          <button
            type="button"
            className="mb-6 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
          >
            <LogOut className="shrink-0" />

            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-gray-200 bg-white px-1 py-2 lg:hidden">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-1 flex-col items-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Home />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Messages */}
        <Link
          to="/chat"
          className="flex flex-1 flex-col items-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <MessageCircle />
          <span className="text-[10px]">Messages</span>
        </Link>

        {/* Create */}
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <PlusSquare />
          <span className="text-[10px]">Create</span>
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="flex flex-1 flex-col items-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Heart />
          <span className="text-[10px]">Notifications</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className="flex flex-1 flex-col items-center gap-1 p-2 text-gray-700 transition hover:text-black"
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>

          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default LeftSidebar;
