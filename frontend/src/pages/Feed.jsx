import React from "react";
import Posts from "./Posts";

const Feed = () => {
  return (
    <div className="my-12 flex w-full justify-center">
      <div className="w-full max-w-2xl">
        <Posts />
      </div>
    </div>
  );
};

export default Feed;
