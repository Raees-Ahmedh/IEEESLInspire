import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlogPost } from '../../types';

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  selectedPost: BlogPost | null;
}

const initialState: BlogState = {
  posts: [
    {
      id: 1,
      title: "How to Choose the Right University",
      description: "Making the right choice for your academic future is crucial for your academic future and long-term goals.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400",
      date: "2 days ago",
      author: "Dr. Samantha Silva",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Understanding A/L Requirements for University Admission",
      description: "A comprehensive guide to A/L grade requirements and how they affect your university application.",
      image: "https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg?auto=compress&cs=tinysrgb&w=400",
      date: "1 week ago",
      author: "Prof. Rajesh Fernando",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Career Prospects After University in Sri Lanka",
      description: "Exploring the various career opportunities available to university graduates in different fields.",
      image: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=400",
      date: "2 weeks ago",
      author: "Ms. Priya Jayawardena",
      readTime: "6 min read"
    }
  ],
  loading: false,
  error: null,
  selectedPost: null,
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedPost: (state, action: PayloadAction<BlogPost | null>) => {
      state.selectedPost = action.payload;
    },
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.unshift(action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setSelectedPost,
  addPost,
} = blogSlice.actions;

export default blogSlice.reducer;