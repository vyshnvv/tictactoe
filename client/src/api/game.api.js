import axios from "axios";

const API_URL = "/api/games";

export const getGame = async (gameId) => {
  try {
    const response = await axios.get(`${API_URL}/${gameId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch game");
  }
};

export const makeMove = async (gameId, position) => {
  try {
    const response = await axios.put(`${API_URL}/${gameId}/move`, { position });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to make move");
  }
};
