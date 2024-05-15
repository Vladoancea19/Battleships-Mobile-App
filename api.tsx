import axios, { AxiosResponse } from 'axios';

const API_URL = 'https://malamute-enabled-yak.ngrok-free.app';

interface LoginResponse {
  accessToken: string;
}

export interface UserDetails {
  user: {
    id: string;
    email: string;
  };
  gamesPlayed: number;
  gamesLost: number;
  gamesWon: number;
  currentlyGamesPlaying: number;
}

interface Game {
  id: string;
  status: string;
  player1Id: string;
  player2Id: string | null;
  playerToMoveId: string;
  player1: {
    id: string;
    email: string;
  };
  player2: {
    id: string;
    email: string;
  } | null;
  moves?: {
    x: string;
    y: number;
    gameId: string;
    playerId: string;
    hit: boolean;
  }[];
  shipsCoord?: {
    x: string;
    y: number;
    size: number;
    direction: string;
  }[];
}

export interface AvailableGamesResponse {
  total: number;
  games: Game[];
}

interface StrikePayload {
  x: string;
  y: number;
}

const register = (email: string, password: string): Promise<AxiosResponse<any>> => {
  return axios.post(`${API_URL}/auth/register`, { email, password });
};

const login = (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => {
  return axios.post(`${API_URL}/auth/login`, { email, password });
};

const getAvailableGames = async (accessToken: string): Promise<AvailableGamesResponse> => {
  try {
    const response = await axios.get<AvailableGamesResponse>(`${API_URL}/game`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch available games:', error);
    throw error;
  }
};

const createGame = async (accessToken: string): Promise<Game> => {
  try {
    const response = await axios.post<Game>(`${API_URL}/game`, null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create game:', error);
    throw error;
  }
};

const getUserDetails = async (accessToken: string): Promise<UserDetails> => {
  try {
    const response = await axios.get<UserDetails>(`${API_URL}/user/details/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    throw error;
  }
};

const joinGame = async (accessToken: string, gameId: string): Promise<AxiosResponse<any>> => {
  try {
    return axios.post(`${API_URL}/game/join/${gameId}`, null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error('Failed to join game:', error);
    throw error;
  }
};

const getGameDetails = async (accessToken: string, gameId: string): Promise<Game> => {
  try {
    const response = await axios.get<Game>(`${API_URL}/game/${gameId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch game details:', error);
    throw error;
  }
};

const sendMapConfiguration = async (accessToken: string, gameId: string, ships: any[]): Promise<AxiosResponse<any>> => {
  try {
    return axios.patch(`${API_URL}/game/${gameId}`, { "ships": ships }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error('Failed to send map configuration:', error);
    throw error;
  }
};

const sendStrike = async (accessToken: string, gameId: string, strikePayload: StrikePayload): Promise<AxiosResponse<any>> => {
  try {
    return axios.post(`${API_URL}/game/strike/${gameId}`, strikePayload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error('Failed to send strike:', error);
    throw error;
  }
};

export { register, login, getUserDetails, getAvailableGames, createGame, joinGame, getGameDetails, sendMapConfiguration, sendStrike };
