import api from './api';

export async function getUserInfo(userId: string): Promise<any> {
  try {
    const response = await api.get(`/get/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user info for user ID ${userId}:`, error);
    throw error; // Re-throw the error after logging
  }
}