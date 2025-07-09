"use client";

import React from 'react';
import KanbanBoard from '@/components/KanbanBoard';

const TasksPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600 mt-2">
          Manage your tasks with our interactive Kanban board. Drag and drop tasks between columns to update their status.
        </p>
      </div>
      
      <KanbanBoard />
    </div>
  );
};

export default TasksPage; 