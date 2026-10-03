const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const getAuthToken = () => {
  // In a real app, you would get this from localStorage, cookies, or a state manager
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
};

export async function createCase(payload: any) {
  const token = getAuthToken();
  const formData = new FormData();
  
  // The backend parseFormDataJson middleware expects the json in the 'data' field
  formData.append('data', JSON.stringify(payload));
  
  const response = await fetch(`${API_URL}/case/create_case`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create case');
  }
  
  return response.json();
}

export async function fetchCases() {
  const token = getAuthToken();
  
  // Notice: In the backend case.route.ts, GET / only returns a mock object: { message: 'Case route' }
  // We will call it anyway as instructed, but it does not return real cases yet.
  const response = await fetch(`${API_URL}/case/get_case/news_feed`, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch cases');
  }
  
  return response.json();
}
