import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Comment = ({ comment }) => {
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

        <p className="text-sm">
          <span className="font-semibold">{comment?.author?.username}</span>

          <span className="ml-2 break-words">{comment?.text}</span>
        </p>
      </div>
    </div>
  );
};

export default Comment;
