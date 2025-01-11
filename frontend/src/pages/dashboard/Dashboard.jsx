import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// this is my dashboard code : 
const Dashboard = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [friendId, setFriendId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
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

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/friend-requests`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setFriendRequests(response.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
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
    fetchFriendRequests();
    fetchRecommendations();
  }, []);

  const handleAddFriend = async () => {
    try {
      await axios.post(`http://localhost:5000/api/friends`, {
        name,
        age,
        email,
      }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      fetchFriends();
      alert("Friend added successfully.");
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to add friend. Please try again.");
    }
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/${friendId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setFriends(friends.filter(friend => friend._id !== friendId));
      alert("Friend deleted successfully.");
    } catch (error) {
      console.error("Error deleting friend:", error);
      alert("Failed to delete friend. Please try again.");
    }
  };

  const handleEditFriend = (friend) => {
    setIsEditing(true);
    setFriendId(friend._id);
    setName(friend.username);
    setAge(friend.age);
    setEmail(friend.email);
  };

  const handleUpdateFriend = async () => {
    try {
      await axios.put(`http://localhost:5000/api/friends/${friendId}`, {
        name,
        age,
        email,
      }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      fetchFriends();
      setIsEditing(false);
      alert("Friend updated successfully.");
    } catch (error) {
      console.error("Error updating friend:", error);
      alert("Failed to update friend. Please try again.");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/accept-request`, { requestId }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      fetchFriendRequests();
      fetchFriends();
      alert("Friend request accepted.");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request. Please try again.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/reject-request`, { requestId }, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      fetchFriendRequests();
      alert("Friend request rejected.");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Failed to reject friend request. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="friends-list">
        {friends.map((friend) => (
          <div key={friend._id} className="friend-card">
            <h2>{friend.username}</h2>
            <p>Age: {friend.age}</p>
            <p>Email: {friend.email}</p>
            <button onClick={() => handleEditFriend(friend)}>Edit</button>
            <button onClick={() => handleDeleteFriend(friend._id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="friend-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isEditing ? (
          <button onClick={handleUpdateFriend}>Update Friend</button>
        ) : (
          <button onClick={handleAddFriend}>Add Friend</button>
        )}
      </div>
      <div className="friend-requests">
        <h2>Friend Requests</h2>
        <ul>
          {friendRequests.map((request) => (
            <li key={request.id}>
              {request.username}
              <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
              <button onClick={() => handleRejectRequest(request.id)}>Reject</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="recommendations">
        <h2>Friend Recommendations</h2>
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>{rec.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default Dashboard;