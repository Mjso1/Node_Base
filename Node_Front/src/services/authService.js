import api from './api';

export const authService = {
  // �α���
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, data: { token, user } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  // ȸ������
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, data: { token, user } };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  // �α׾ƿ�
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ���� ����� ���� ��������
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ��ū Ȯ��
  getToken: () => {
    return localStorage.getItem('token');
  },

  // �α��� ���� Ȯ��
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};