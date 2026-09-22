import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Comment = ({ comment }) => {
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

  return (
    <div className="my-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={comment?.author?.profilePicture}
            alt={comment?.author?.username || "User"}
          />

          <AvatarFallback>
            {comment?.author?.username?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-semibold">{comment?.author?.username}</span>

            <span className="ml-2 break-words">{comment?.text}</span>
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {formatDate(comment?.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
