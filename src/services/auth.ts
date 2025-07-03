import api from './api'; // Instância do Axios

// Tipos para resposta da API de login
interface LoginResponse {
  message: string;
  token: string;
  userInfo: UserInfo;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  // Adicione mais campos conforme necessário
}

// Tipos para cadastro de usuário
interface RegisterData {
  name: string;
  email: string;
  password: string;
  // Adicione mais campos conforme necessário
}

// Function for user login
export const login = async (email: string, password: string): Promise<UserInfo> => {
  try {
    const response = await api.post<LoginResponse>('/auth/sign-in', { email, password });

    if (response.data.message === 'Logado com sucesso') {
      const { token, userInfo } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      return userInfo;
    } else {
      throw new Error(response.data.message || 'Erro desconhecido');
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Erro ao fazer login. Tente novamente.');
  }
};

// Function for user registration
export const register = async (userData: RegisterData): Promise<any> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao registrar');
  }
};

// Function for user logout
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/entrar';
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};
