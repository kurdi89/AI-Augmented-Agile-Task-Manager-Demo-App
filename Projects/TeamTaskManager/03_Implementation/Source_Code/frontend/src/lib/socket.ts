import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token?: string) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    
    this.socket = io(url, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null;
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// Create singleton instance
export const socket = new SocketClient();

// Export for convenience
export default socket;
