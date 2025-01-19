export interface LoginResponse {
  token: string;
  error?: string;
}

const API_URL = 'http://localhost:8080/';

export const login = async (username: string, password: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}connexion_labo.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Identifiant ou mot de passe incorrect');
    }

    // Store token in localStorage with expiration
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur de connexion au serveur');
  }
};

export const checkTokenExpiration = (): void => {
  const expiration = localStorage.getItem('tokenExpiration');
  if (expiration) {
    const expirationTime = parseInt(expiration, 10);
    if (new Date().getTime() > expirationTime) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiration');
    }
  }
};

export const getAuthToken = (): string | null => {
  checkTokenExpiration();
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiration');
};

// New function to create authenticated fetch requests
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token is invalid or expired
    logout();
    throw new Error('Session expired. Please login again.');
  }

  return response;
};