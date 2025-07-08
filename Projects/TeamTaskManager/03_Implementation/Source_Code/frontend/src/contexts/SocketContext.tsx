// Team Task Manager - Socket.io Context
// Sprint 2: Real-time Collaboration
// Created: July 6, 2025

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Task } from '../types/task';

interface ISocketContext {
  socket: Socket | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  joinProject: () => {},
  leaveProject: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useMemo(() => {
    const socketIo = io(process.env.REACT_APP_WS_URL || 'ws://localhost:5000', {
      withCredentials: true,
    });
    return socketIo;
  }, []);

  const joinProject = useCallback((projectId: string) => {
    socket.emit('joinProject', projectId);
  }, [socket]);

  const leaveProject = useCallback((projectId: string) => {
    socket.emit('leaveProject', projectId);
  }, [socket]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    socket.on('task_created', (task: Task) => {
      console.log('Task created:', task);
      // Here you would typically update your application's state
    });

    socket.on('task_updated', (task: Task) => {
      console.log('Task updated:', task);
      // Here you would typically update your application's state
    });

    socket.on('task_deleted', (taskId: string) => {
      console.log('Task deleted:', taskId);
      // Here you would typically update your application's state
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};
