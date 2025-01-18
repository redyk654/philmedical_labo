export interface LoginResponse {
    token: string;
    error?: string;
  }
  
  export const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch('YOUR_PHP_API_ENDPOINT/login.php', {
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