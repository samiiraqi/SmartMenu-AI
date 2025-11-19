import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect(tableNumber) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      query: { table: tableNumber }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected for table', tableNumber);
      this.socket.emit('join_table', { table_number: tableNumber });
    });

    this.socket.on('order_status_update', (data) => {
      console.log('Order status update:', data);
      if (this.callbacks.onStatusUpdate) {
        this.callbacks.onStatusUpdate(data);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onStatusUpdate(callback) {
    this.callbacks.onStatusUpdate = callback;
  }
}

export default new WebSocketService();
