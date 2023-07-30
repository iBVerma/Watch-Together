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


const PORT = process.env.PORT || 3005;

<<<<<<< HEAD
app.get('/test', (req, res, next) => {
	res.send({ message: 'Hello World' });
});
=======
// app.get('/', (req, res, next) => {
// 	console.log("Running");
// 	res.send("Hello");
// 	// res.send({ message: 'Hello World' });
// });
>>>>>>> 1745356ed88ae1f0c10725186875c4546f30fc46

ioUtils.setupIO(io);

server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
