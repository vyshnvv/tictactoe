import axios from "axios";

const API_URL = "/api/challenges";

export const sendChallenge = async (challengedUserId) => {
  try {
    const response = await axios.post(`${API_URL}/send`, { challengedUserId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to send challenge");
  }
};

export const getPendingChallenges = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch pending challenges"
    );
  }
};

export const acceptChallenge = async (challengeId) => {
  try {
    const response = await axios.put(`${API_URL}/${challengeId}/accept`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to accept challenge"
    );
  }
};

export const declineChallenge = async (challengeId) => {
  try {
    const response = await axios.put(`${API_URL}/${challengeId}/decline`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to decline challenge"
    );
  }
};

export const getChallengeHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch challenge history"
    );
  }
};
