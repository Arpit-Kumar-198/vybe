import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  selectedPost: null,
};

const postSlice = createSlice({
  name: "post",

  initialState,

  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },

    // Update likes in real-time
    updatePostLikes: (state, action) => {
      const { postId, likes } = action.payload;

      const post = state.posts.find((post) => post._id === postId);

      if (post) {
        post.likes = likes;
      }

      // Also update selected post
      if (state.selectedPost?._id === postId) {
        state.selectedPost.likes = likes;
      }
    },

    // Add comment in real-time
    addCommentToPost: (state, action) => {
      const { postId, comment } = action.payload;

      const post = state.posts.find(
        (post) => String(post._id) === String(postId),
      );

      if (post) {
        const alreadyExists = post.comments.some(
          (item) => String(item._id) === String(comment._id),
        );

        if (!alreadyExists) {
          post.comments.push(comment);
        }
      }

      if (
        state.selectedPost &&
        String(state.selectedPost._id) === String(postId)
      ) {
        const alreadyExists = state.selectedPost.comments.some(
          (item) => String(item._id) === String(comment._id),
        );

        if (!alreadyExists) {
          state.selectedPost.comments.push(comment);
        }
      }
    },

    // Delete post in real-time
    removePost: (state, action) => {
      const { postId } = action.payload;

      state.posts = state.posts.filter((post) => post._id !== postId);

      if (state.selectedPost?._id === postId) {
        state.selectedPost = null;
      }
    },
  },
});

export const {
  setPosts,
  setSelectedPost,
  updatePostLikes,
  addCommentToPost,
  removePost,
} = postSlice.actions;

export default postSlice.reducer;
