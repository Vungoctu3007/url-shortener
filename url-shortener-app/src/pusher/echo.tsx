import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from '@/axios/axiosInstance';

interface Window {
  Pusher: typeof Pusher;
}

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY as string,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER as string,
  forceTLS: true,
  
  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        api.post('/broadcasting/auth', {
          socket_id: socketId,
          channel_name: channel.name
        })
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => {
          callback(error, null);
        });
      }
    };
  },
});

export default echo;