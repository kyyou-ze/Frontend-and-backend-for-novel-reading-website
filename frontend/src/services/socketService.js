import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = localStorage.getItem('token');
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  subscribeToNovel(novelId) {
    if (this.socket) {
      this.socket.emit('subscribe_novel', novelId);
    }
  }

  subscribeToAuthor(authorId) {
    if (this.socket) {
      this.socket.emit('subscribe_author', authorId);
    }
  }

  onNewChapter(callback) {
    if (this.socket) {
      this.socket.on('new_chapter', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();