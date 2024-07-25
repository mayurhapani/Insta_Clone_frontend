import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function Profile() {
  const [myPosts, setMyPosts] = useState([]);
  const [myPost, setMyPost] = useState({});
  const [comment, setComment] = useState("");
  const [viewMyPost, setViewMyPost] = useState(false);
  const [newCommentAdd, setNewCommentAdd] = useState(false);
  const [delComment, setDelComment] = useState(false);
  const [user, setUser] = useState({});
  const [proPicModel, setProPicModel] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const targetProfilePictureInput = useRef("");

  const { isLoggedIn, myPostId, setMyPostId } = useContext(AuthContext);

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token") || cookies.get("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getUser`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        // setLogInUser(response.data.user);
        setUser(response.data.user);
        setMyPosts(response.data.myPost);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUser();
  }, [navigate, isLoggedIn, myPostId, viewMyPost]);

  //todo. get my post
  useEffect(() => {
    if (!myPostId) {
      return;
    }
    const fetchMyPosts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/post/getMyPosts/${myPostId}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setMyPost(response.data);
        setViewMyPost(true);
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
  }, [myPostId, viewMyPost, newCommentAdd, delComment]);

  //! delete post
  const deletePost = async (id) => {
    try {
      if (window.confirm("Do you want to delete this post")) {
        const response = await axios.delete(`${BASE_URL}/post/deletePost/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        toast.success(response.data.message);
        setViewMyPost(false);
        setMyPostId("");
      }
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

  //! delete comments
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

  // to upload profile photo
  const chooseProPic = () => {
    targetProfilePictureInput.current.click();
  };

  const uploadProfilePic = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!profilePic) {
        toast.error("Image is missing");
        navigate("/profile");
        return;
      }

      // image upload to cloudinary
      const dataImage = new FormData();
      dataImage.append("file", profilePic);
      dataImage.append("upload_preset", "instaClone");
      dataImage.append("cloud_name", "instaclone21");
      dataImage.append("folder", "users");

      const responseImage = await axios.post(
        "https://api.cloudinary.com/v1_1/instaclone21/upload",
        dataImage
      );
      const uploadedImagePath = responseImage.data.url;

      // data send to backend
      const response = await axios.post(
        `${BASE_URL}/profilePic`,
        {
          image: uploadedImagePath,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      setProPicModel(false);
      window.location.reload();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (profilePic) {
      uploadProfilePic();
    }
  }, [profilePic]);

  //! delete profile picture
  const deleteProfilePic = async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/removeProfilePic`, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      toast.success(response.data.message);
      window.location.reload();
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
        <div className="pt-32 flex flex-col items-center w-1/2 mx-auto">
          {/* header */}
          <div className="w-full">
            <div className="flex items-center">
              <img
                className="rounded-full w-32 h-32 cursor-pointer"
                onClick={() => {
                  setProPicModel(true);
                }}
                src={user.image}
                alt="https://via.placeholder.com/150"
              />
              <div className="ps-5">
                <h1 className="text-3xl font-bold text-center mb-5 ">{user.username}</h1>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 font-semibold me-4">
                    <span>{myPosts.length ? myPosts.length : "0"}</span> Posts
                  </p>
                  <p className="text-sm text-gray-600 font-semibold me-4">
                    <span>{user.followers ? user.followers.length : "0"}</span> Followers
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    <span>{user.following ? user.following.length : "0"}</span> Following
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="w-full mx-auto mt-2 mb-10" />

          {/* posts */}
          <div className=" flex flex-wrap">
            {myPosts.map((post) => (
              <div key={post._id} className="w-1/3 p-1 ">
                <div
                  onClick={() => {
                    setMyPost(post);
                    setViewMyPost(true);
                    setMyPostId(post._id);
                  }}
                  className="border border-gray-300 w-full aspect-square cursor-pointer"
                >
                  <img className="w-full h-full" src={post.image} alt="" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* view my post */}
      {viewMyPost && (
        <div className=" fixed w-screen h-screen top-0 left-0 bottom-0 bg-[rgba(27,28,24,0.34)]">
          <div className="w-[80%] xl:w-[60%] h-[70%]  mt-[8%] mx-auto bg-white flex">
            <div className="w-full">
              <img className="w-full h-full aspect-auto" src={myPost.image} alt="" />
            </div>
            <div className="flex flex-col w-full">
              {/* card header */}
              <div className="flex justify-start items-center p-2 border-b-2 h-[12%]">
                <img className="w-[40px] rounded-full me-5" src={myPost.user.image} alt="" />
                <span className="font-semibold me-auto">@ {myPost.user.username}</span>
                <span
                  onClick={() => {
                    deletePost(myPost._id);
                  }}
                  className="material-symbols-outlined py-2 px-1 cursor-pointer text-red-700"
                >
                  delete
                </span>
              </div>

              {/* comment section */}
              <div className="h-[76%] overflow-y-scroll">
                {myPost.comments.length > 0 ? (
                  myPost.comments.map((comment, index) => (
                    <div className="p-2 flex items-center justify-between" key={index}>
                      <p className="">
                        <span className="font-bold me-2">@ {comment.user.username} : </span>
                        {comment.comment}
                      </p>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          deleteComment(comment._id, myPost._id);
                        }}
                      >
                        <span className="material-symbols-outlined text-red-800 text-lg font-bold">
                          close
                        </span>
                      </div>
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
                    addComment(myPost);
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
              setViewMyPost(false);
              setMyPostId("");
            }}
          >
            <span className="material-symbols-outlined text-white text-4xl font-bold">close</span>
          </div>
        </div>
      )}

      {/* to set profile pic */}
      {proPicModel && (
        <div className=" fixed w-screen h-screen top-0 left-0 bottom-0 bg-[rgba(27,28,24,0.34)]">
          <div className="flex justify-center items-center h-full">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-center py-4">Change Profile Photo</h2>
              <div className="flex justify-center py-4 border-t-2">
                <button
                  className="text-blue-500 hover:text-blue-800 font-semibold text-lg"
                  onClick={() => chooseProPic()}
                >
                  Choose Profile Picture
                </button>
                <input
                  ref={targetProfilePictureInput}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setProfilePic(e.target.files[0]);
                  }}
                />
              </div>
              <div className="flex justify-center py-4 border-t-2">
                <button
                  className="text-red-500 hover:text-red-800 font-semibold text-lg"
                  onClick={() => deleteProfilePic()}
                >
                  Remove Current Profile Picture
                </button>
              </div>
              <div className="flex justify-center py-4 border-t-2">
                <button
                  onClick={() => {
                    setProPicModel(false);
                  }}
                  className="font-semibold text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
