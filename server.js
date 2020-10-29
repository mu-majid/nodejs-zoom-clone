const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const { v4: uuidv4 } = require('uuid');


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  return res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  return res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log('Joined the Room ', roomId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (msg) => {
      io.to(roomId).emit('createMessage', msg)
    })
  });
});

server.listen(3030, () => {
  console.log('Server is up and running on 3000!');
});