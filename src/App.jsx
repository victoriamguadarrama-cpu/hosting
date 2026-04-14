import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router";
import "./App.css";
import { DefaultLayout } from "./pages/DefaultLayout";
import axios from "axios";
import { loader as signInLoader } from "./pages/Auth/SignInWithGoogle";
import supabase from "./utils/supabase";
import Play from "./pages/Playlists/Play";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeData } from "./store/action";
import useYouTubeInit from "./hooks/useYouTubeInit";

const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    Component: DefaultLayout,
    loader: async () => {
      const token = await supabase.auth.getUser();
      return token.data.user;
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("./pages/Home");
          return { Component: module.default };
        },
      },
      { path: "login", loader: signInLoader },
      {
        path: "logout",
        loader: async () => {
          await supabase.auth.signOut();
          return redirect("/");
        },
      },
      {
        path: "playlist",
        children: [
          {
            index: true,
            lazy: async () => {
              const module = await import("./pages/Playlists/ViewAll");
              return { Component: module.default, ...module };
            },
          },
          { path: ":id", element: <h1>View Specific Playlist</h1> },
          { path: "create/:id", element: <h1>Create new playlist</h1> },
          { path: "edit/:id", element: <h1>Edit specific playlist</h1> },
          { path: "delete/:id", element: <h1>Delete specific playlist</h1> },
          { path: "watch/:id", Component: Play },
        ],
      },
      {
        path: "video",
        children: [
          {
            index: true,
            lazy: async () => {
              const module = await import("./pages/Videos/AllVideos");
              return { Component: module.default, ...module };
            },
          },
          { path: ":id", element: <h1>View Specific Video</h1> },
          { path: "create/:id", element: <h1>Create new Video</h1> },
          {
            path: "edit/:id",
            lazy: async () => {
              const module = await import("./pages/Videos/Edit");
              return { Component: module.default, ...module };
            },
          },
          {
            path: "delete/:id",
            loader: async ({ params }) => {
              try {
                await axios.delete("https://slackclonebackendapi.onrender.com//videos/" + params.id);
              } catch (e) {
                console.log(e);
              }
              return redirect("/video");
            },
          },
          { path: "watch/:id", element: <h1>Watch a specific Video</h1> },
        ],
      },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initializeData("https://slackclonebackendapi.onrender.com//videos"));
  }, [dispatch]);

  useYouTubeInit();
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
