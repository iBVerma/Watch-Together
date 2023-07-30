const express = require('express');
const app = express();
const server = require('http').createServer(app);
const ioUtils = require('./utils/io');

const io = require('socket.io')(server, {
	cors :{
		// path: '/socket',
		origin: 'http://localhost:3000',
		methods: ["GET","POST"], 
		credentials: true, 
		transport: ["websocket","polling"] 
	}, 
	allowEIO3: true 
});

const PORT = process.env.PORT || 3005;

app.get('/test', (req, res, next) => {
	res.send({ message: 'Hello World' });
});

ioUtils.setupIO(io);

server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));