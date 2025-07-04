// Data storage utility for managing user wallet addresses and their created tokens

export interface TokenData {
  address: string; // Token contract address
  name: string;
  symbol: string;
  description: string;
  type: string;
  image: string;
  ipfsUri: string;
  creatorAddress: string; // Wallet address of creator
  createdAt: string;
  txHash: string;
}

export interface UserData {
  walletAddress: string;
  tokens: TokenData[];
  lastUpdated: string;
}

// Storage keys
const USERS_DATA_KEY = 'artify_users_data';
const SESSION_USER_KEY = 'artify_session_user';

// Get all users data from localStorage
export const getAllUsersData = (): UserData[] => {
  try {
    const data = localStorage.getItem(USERS_DATA_KEY);
    const parsed = data ? JSON.parse(data) : [];
    console.log('[dataStorage] getAllUsersData:', parsed);
    return parsed;
  } catch (error) {
    console.error('[dataStorage] Error reading users data:', error);
    return [];
  }
};

// Save all users data to localStorage
export const saveAllUsersData = (usersData: UserData[]): void => {
  try {
    localStorage.setItem(USERS_DATA_KEY, JSON.stringify(usersData));
    console.log('[dataStorage] saveAllUsersData:', usersData);
  } catch (error) {
    console.error('[dataStorage] Error saving users data:', error);
  }
};

// Get user data by wallet address
export const getUserData = (walletAddress: string): UserData | null => {
  const usersData = getAllUsersData();
  const found = usersData.find(user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null;
  console.log('[dataStorage] getUserData:', walletAddress, found);
  return found;
};

// Save or update user data
export const saveUserData = (userData: UserData): void => {
  const usersData = getAllUsersData();
  const existingUserIndex = usersData.findIndex(
    user => user.walletAddress.toLowerCase() === userData.walletAddress.toLowerCase()
  );

  if (existingUserIndex >= 0) {
    // Update existing user
    usersData[existingUserIndex] = {
      ...usersData[existingUserIndex],
      ...userData,
      lastUpdated: new Date().toISOString()
    };
    console.log('[dataStorage] saveUserData: updated', userData.walletAddress);
  } else {
    // Add new user
    usersData.push({
      ...userData,
      lastUpdated: new Date().toISOString()
    });
    console.log('[dataStorage] saveUserData: new', userData.walletAddress);
  }

  saveAllUsersData(usersData);
};

// Add a new token to a user
export const addUserToken = (walletAddress: string, tokenData: TokenData): void => {
  const userData = getUserData(walletAddress);
  
  if (userData) {
    // Check if token already exists
    const tokenExists = userData.tokens.some(token => token.address.toLowerCase() === tokenData.address.toLowerCase());
    
    if (!tokenExists) {
      userData.tokens.push(tokenData);
      userData.lastUpdated = new Date().toISOString();
      saveUserData(userData);
      console.log('[dataStorage] addUserToken: added', walletAddress, tokenData);
    } else {
      console.log('[dataStorage] addUserToken: already exists', walletAddress, tokenData.address);
    }
  } else {
    // Create new user with this token
    const newUserData: UserData = {
      walletAddress,
      tokens: [tokenData],
      lastUpdated: new Date().toISOString()
    };
    saveUserData(newUserData);
    console.log('[dataStorage] addUserToken: new user', walletAddress, tokenData);
  }
};

// Get all tokens from all users
export const getAllTokens = (): TokenData[] => {
  const usersData = getAllUsersData();
  const tokens = usersData.flatMap(user => user.tokens);
  console.log('[dataStorage] getAllTokens:', tokens);
  return tokens;
};

// Get tokens by creator address
export const getTokensByCreator = (creatorAddress: string): TokenData[] => {
  const userData = getUserData(creatorAddress);
  return userData ? userData.tokens : [];
};

// Session storage for current user
export const setSessionUser = (walletAddress: string): void => {
  try {
    sessionStorage.setItem(SESSION_USER_KEY, walletAddress);
  } catch (error) {
    console.error('Error setting session user:', error);
  }
};

export const getSessionUser = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_USER_KEY);
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
};

export const clearSessionUser = (): void => {
  try {
    sessionStorage.removeItem(SESSION_USER_KEY);
  } catch (error) {
    console.error('Error clearing session user:', error);
  }
};

// Clear all data (for testing/reset)
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(USERS_DATA_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}; 