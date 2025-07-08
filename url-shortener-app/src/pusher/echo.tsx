import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

interface Window {
  Pusher: typeof Pusher;
}

window.Pusher = Pusher;

function getCookie(name: string): string | null {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
}

const token = getCookie('access_token');

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY as string,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER as string,
  forceTLS: true,
  authEndpoint: import.meta.env.VITE_BROADCAST_AUTH_ENDPOINT || 'http://localhost:8000/broadcasting/auth',
  auth: {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  },
});

export default echo;
