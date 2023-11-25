const express=require('express');
const app=express();
const http=require('http');
const {Server}=require('socket.io');
const cors=require('cors');

app.use(express.json());
app.use(cors());

const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

io.on('connection',(socket)=>{
    console.log('user connected',socket.id)

    socket.on('send_message',(data)=>{
        socket.broadcast.emit('receive_message',data);
    })
})



server.listen(3001,()=>{
    console.log('server is running on port 3001');
})