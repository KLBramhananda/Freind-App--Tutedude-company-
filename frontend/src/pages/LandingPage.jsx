import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./LandingPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/friends`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/recommendations`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRecommendations();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?query=${searchTerm}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setFriends(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUnfriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/friends/${friendId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setFriends(friends.filter(friend => friend.id !== friendId));
      alert("Friend removed successfully.");
    } catch (error) {
      console.error("Error unfriending:", error);
      alert("Failed to remove friend. Please try again.");
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/friend-request`, {
        userId,
      }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request. Please try again.");
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      <main className="main-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="content">
          <div className="friends-list">
            <h2>Your Friends</h2>
            <ul>
              {friends.map((friend) => (
                <li key={friend.id}>
                  {friend.name}
                  <button onClick={() => handleUnfriend(friend.id)}>Unfriend</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="recommendations">
            <h2>Friend Recommendations</h2>
            <ul>
              {recommendations.map((rec) => (
                <li key={rec.id}>
                  {rec.name}
                  <button onClick={() => handleSendFriendRequest(rec.id)}>Add Friend</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
