import { useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { setNotifications, markAllAsRead } from "../redux/notificationSlice";

const Notifications = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const { notifications } = useSelector((store) => store.notification);

  // ==================== FORMAT DATE ====================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==================== FETCH NOTIFICATIONS ====================

  useEffect(() => {
    if (!open) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/notification",
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setNotifications(res.data.notifications));
        }
      } catch (error) {
        console.error("Fetch notifications error:", error);
      }
    };

    fetchNotifications();
  }, [open, dispatch]);

  // ==================== CLOSE ====================

  const handleClose = async () => {
    try {
      await axios.patch(
        "http://localhost:8000/api/v1/notification/mark-read",
        {},
        {
          withCredentials: true,
        },
      );

      dispatch(markAllAsRead());

      onClose();
    } catch (error) {
      console.error("Mark notifications error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-lg">
        {/* ==================== HEADER ==================== */}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Notifications</h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ==================== NOTIFICATIONS ==================== */}

        <div className="space-y-4 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {/* Profile picture */}

                <img
                  src={
                    notification.sender?.profilePicture || "/default-avatar.png"
                  }
                  alt="Profile"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                {/* Notification content */}

                <div className="min-w-0 flex-1">
                  <p className="text-sm">{notification.message}</p>

                  {/* Notification type */}

                  <p className="mt-1 text-xs capitalize text-gray-500">
                    {notification.type}
                  </p>

                  {/* Date */}

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
