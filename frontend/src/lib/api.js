export const apiCall = async (endpoint, options = {}) => {
  const url = `/api/v1${endpoint}`;
  
  // Try to use auth token from localStorage if available, otherwise rely on HTTP-only cookies
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Something went wrong');
  }

  return data;
};
