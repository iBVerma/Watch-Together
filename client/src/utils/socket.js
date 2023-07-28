
import { showToast } from '../utils/helper';
import { io } from 'socket.io-client';

export const createConnection = (name, roomId = null, videoId = null) => {
  // Log the name and videoId (for debugging purposes)
  console.log(name);
  console.log(videoId);
  console.log("Socket");

  return new Promise((resolve) => {
    // Replace 'http://your-server-url.com' with the actual URL of your socket.io server
    const socket = io('https://watchtogether-server.vercel.app/', { path: '/socket' });

    // Listen for the 'connect' event, indicating the connection is established
    socket.on('connect', () => {
      // Emit the 'join' event to the server with the provided data
      socket.emit('join', {
        roomId: roomId || socket.id,
        name,
        userId: socket.id,
        videoId,
      });

      // Resolve the Promise with the socket object, making it available to the caller
      resolve(socket);
    });
  });
};


export const bindSocketEvents = (socket, dispatchFunc) => {
	if (!socket) return;
	const { userDispatch, signalDispatch } = dispatchFunc;

	const dispatchAdminMessage = (id, text) => {
		userDispatch({
			type: 'UPDATE_MESSAGES',
			data: {
				from: null,
				text,
				id,
			},
		});
	};

	socket.on('newMessage', (data) => {
		const name = data.payload && data.payload.name;

		switch (data.type) {
			case 'userJoin':
				showToast(
					'success',
					`${data.payload.name} has joined the room`
				);
				dispatchAdminMessage(data.id, `${name} has joined`);
				break;

			case 'userLeft':
				showToast('info', `${data.payload.name} has left the room`);
				dispatchAdminMessage(data.id, `${name} has left`);
				break;

			case 'userMessage':
				userDispatch({ type: 'UPDATE_MESSAGES', data });
				break;

			case 'changeVideo':
				// initiated when user is joining the room first time
				// tells him about the currently playing video
				userDispatch({
					type: 'UPDATE_VIDEO_ID',
					videoId: data.payload.videoId,
				});
				break;

			case 'updateVideoId':
				// initiated when video is changed in the middle of playing
				// everyone is informed of the newly selected video
				signalDispatch({ type: 'RESET_SIGNAL_STATE' });
				signalDispatch({ type: 'VIDEO_CHANGING', videoChanging: true });
				userDispatch({
					type: 'UPDATE_VIDEO_ID',
					videoId: data.payload.videoId,
				});
				showToast(
					'info',
					`${data.payload.user.name} has changed the video`,
					'bottom-start'
				);
				dispatchAdminMessage(
					data.id,
					`The video has been changed by ${data.payload.user.name}`
				);
				break;

			case 'updateVideoState':
				signalDispatch({
					type: 'SET_TRANSITION',
					transition: true,
				});
				console.log(
					'update video state triggered =',
					data.payload.type
				);
				switch (data.payload.type) {
					case 'PLAY':
						signalDispatch({
							type: 'PLAY_VIDEO',
							currentTime: data.payload.currentTime,
						});
						showToast(
							'info',
							`${data.payload.user.name} has started playing the video`,
							'bottom-start'
						);
						break;

					case 'PAUSE':
						signalDispatch({
							type: 'PAUSE_VIDEO',
							timestamp: Date.now(),
						});
						showToast(
							'info',
							`${data.payload.user.name} has paused the video`,
							'bottom-start'
						);
						break;

					default:
						break;
				}
				break;

			default:
				break;
		}
	});

	socket.on('updateUserList', (userList) => {
		console.log('new user list', userList);
		userDispatch({ type: 'UPDATE_USER_LIST', users: userList });
	});
};
