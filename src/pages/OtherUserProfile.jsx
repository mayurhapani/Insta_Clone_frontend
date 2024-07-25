import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

export default function OtherUserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userPost, setUserPost] = useState({});
  const [userPostId, setUserPostId] = useState("");
  const [viewPost, setViewPost] = useState(null);

  const [comment, setComment] = useState("");
  const [delComment, setDelComment] = useState(false);
  const [newCommentAdd, setNewCommentAdd] = useState(false);
  const { logInUser } = useContext(AuthContext);
  const [isFollow, setIsFollow] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  //get other user info
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUser/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUser(response.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    // Fetch posts when component mounts
    const fetchUserPosts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUserPosts/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setPosts(response.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [id, delComment, newCommentAdd, isFollow]);

  // get other user post
  useEffect(() => {
    if (!userPostId) {
      return;
    }
    const fetchMyPosts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/oUser/getUserPost/${userPostId}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUserPost(response.data);
        setViewPost(true);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };
    setDelComment(false);

    fetchMyPosts();
  }, [userPostId, viewPost, newCommentAdd, delComment, isFollow]);

  useEffect(() => {
    const checkFollow = () => {
      if (user && user.followers.includes(localStorage.getItem("id"))) {
        setIsFollow(true);
      } else {
        setIsFollow(false);
      }
    };

    checkFollow();
  }, [user, logInUser, isFollow]);

  // delete comments
  const deleteComment = async (commentId, postId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/post/deleteComment`, {
        params: {
          commentId,
          postId,
        },
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setDelComment(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  // add comments
  const addComment = async (post) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/post/addComment/${post._id}`,
        { comment },
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setComment("");
      setNewCommentAdd(true);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  // follow user
  const followUser = async (postUserId) => {
    try {
      const response = await axios.get(`${BASE_URL}/follow/${postUserId}`, {
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setIsFollow(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  //unfollow user
  const unfollowUser = async (postUserId) => {
    try {
      const response = await axios.get(`${BASE_URL}/unfollow/${postUserId}`, {
        withCredentials: true,
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      setIsFollow(false);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <>
      <div className="container mx-auto ">
        {user ? (
          <div className="pt-32 flex flex-col items-center w-2/3 lg:w-1/2 mx-auto">
            {/* header */}
            <div className="w-full">
              <div className="flex items-center">
                <img
                  className="rounded-full w-32 h-32"
                  src={user.image}
                  alt="https://via.placeholder.com/150"
                />
                <div className="ps-5">
                  <div className="flex justify-between items-center  mb-5">
                    <h1 className="text-3xl font-bold text-center me-4">@ {user.username}</h1>
                    {id != localStorage.getItem("id") && (
                      <button
                        className="bg-blue-600 text-white rounded-lg py-1 px-3 font-semibold hover:bg-blue-500"
                        onClick={() => {
                          isFollow ? unfollowUser(user._id) : followUser(user._id);
                        }}
                      >
                        {isFollow ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600 font-semibold me-4">
                      <span>{posts.length || 0}</span> Posts
                    </p>
                    <p className="text-sm text-gray-600 font-semibold me-4">
                      <span>{user.followers.length || 0}</span> Followers
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      <span>{user.following.length || 0}</span> Following
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="w-full mx-auto mt-2 mb-10" />

            {/* posts */}
            <div className=" flex flex-wrap">
              {posts.map((post) => (
                <div key={post._id} className="w-1/3 p-1 ">
                  <div
                    onClick={() => {
                      // setUserPost(post);
                      // setViewPost(true);
                      setUserPostId(post._id);
                    }}
                    className="border border-gray-300 w-full aspect-square cursor-pointer"
                  >
                    <img className="w-full h-full" src={post.image} alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-screen flex justify-center items-center">
            <p className="text-black text-2xl font-semibold">Loading...</p>
          </div>
        )}
      </div>

      {/* view my post */}
      {viewPost && (
        <div className=" fixed w-screen h-screen top-0 left-0 bottom-0 bg-[rgba(27,28,24,0.34)]">
          <div className="w-[80%] xl:w-[60%] h-[70%]  mt-[8%] mx-auto bg-white flex">
            <div className="w-full">
              <img className="w-full h-full aspect-auto" src={userPost.image} alt="" />
            </div>
            <div className="flex flex-col w-full">
              {/* card header */}
              <div className="flex justify-start items-center p-2 border-b-2 h-[12%]">
                <img className="w-[40px] rounded-full me-5" src={userPost.user.image} alt="" />
                <span className="font-semibold me-auto">@ {userPost.user.username}</span>
              </div>

              {/* comment section */}
              <div className="h-[76%] overflow-y-scroll">
                {userPost.comments.length > 0 ? (
                  userPost.comments.map((comment, index) => (
                    <div className="p-2 flex items-center justify-between" key={index}>
                      <p className="">
                        <span className="font-bold me-2">@ {comment.user.username} : </span>
                        {comment.comment}
                      </p>
                      {comment.user._id == logInUser._id && (
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            deleteComment(comment._id, userPost._id);
                          }}
                        >
                          <span className="material-symbols-outlined text-red-800 text-lg font-bold">
                            close
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full w-full flex justify-center items-center">
                    <p>No Comments Yet</p>
                  </div>
                )}
              </div>

              {/* comment form */}
              <div className="flex items-center h-[12%] border-t-2 p-2">
                <span className="material-symbols-outlined">mood</span>
                <input
                  className="outline-none border border-gray-200 p-1 text-sm rounded-lg w-full mx-2"
                  type="text"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                  placeholder="Add Comments..."
                />
                <button
                  onClick={() => {
                    addComment(userPost);
                  }}
                  className="px-1 pb-2 text-lg text-blue-800 font-semibold"
                >
                  post
                </button>
              </div>
            </div>
          </div>

          {/* close comment section */}
          <div
            className=" fixed top-5 right-5 cursor-pointer"
            onClick={() => {
              setViewPost(false);
              setUserPostId("");
            }}
          >
            <span className="material-symbols-outlined text-white text-4xl font-bold">close</span>
          </div>
        </div>
      )}
    </>
  );
}
