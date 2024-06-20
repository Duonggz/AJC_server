import { Server } from 'socket.io'
import EmitSocketEvent from './EmitSocket.event'

const initSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: '*',
    },
  })

  // bắn sự kiện đến một user nào đó từ server
  EmitSocketEvent.on((event, ...args) => {
    console.log(`event: "${event}"`, args)
    io.emit(event, ...args)
  })
}

export default initSocket
