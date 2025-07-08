"use client";

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Task } from '@/lib/types';
import ProjectList from '@/components/ProjectList';
import FileUpload from '@/components/FileUpload';
import FilePreview from '@/components/FilePreview';

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attachments, setAttachments] = useState<{ [key: string]: { fileUrl: string; fileType: string } }>({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to socket server');
    });

    socket.on('task:created', (newTask: Task) => {
      console.log('task created', newTask);
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on('task:attachment:created', (attachment: { taskId: string; fileUrl: string; fileType: string }) => {
      setAttachments((prevAttachments) => ({
        ...prevAttachments,
        [attachment.taskId]: { fileUrl: attachment.fileUrl, fileType: attachment.fileType },
      }));
    });

    socket.on('task:updated', (updatedTask: Task) => {
      console.log('task updated', updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    socket.on('task:deleted', ({ id }: { id: number }) => {
      console.log('task deleted', id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    });

    return () => {
      socket.off('connect');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      // In a real app, you'd fetch this from your API
      // const response = await fetch('/api/tasks');
      // const data = await response.json();
      // setTasks(data);
    };
    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Dashboard Page</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.status}
          </li>
        ))}
      </ul>
      <ProjectList />
      <FileUpload />
      {Object.entries(attachments).map(([taskId, { fileUrl, fileType }]) => (
        <FilePreview key={taskId} fileUrl={fileUrl} fileType={fileType} />
      ))}
    </div>
  );
};

export default DashboardPage;
