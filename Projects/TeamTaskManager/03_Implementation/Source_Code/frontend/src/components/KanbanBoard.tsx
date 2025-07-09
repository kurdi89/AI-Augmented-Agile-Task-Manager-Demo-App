"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority, CreateTaskForm } from '@/lib/types';
import apiClient from '@/lib/api';
import { socket } from '@/lib/socket';
import { Plus, Edit, Trash2, User, Calendar, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  projectId?: string;
  showCreateButton?: boolean;
  onTaskSelect?: (task: Task) => void;
}

interface TaskColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  showCreateButton = true,
  onTaskSelect,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Define columns
  const columns: TaskColumn[] = [
    {
      id: TaskStatus.TODO,
      title: 'To Do',
      color: 'bg-gray-100 border-gray-200',
      tasks: [],
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: 'In Progress',
      color: 'bg-blue-100 border-blue-200',
      tasks: [],
    },
    {
      id: TaskStatus.COMPLETED,
      title: 'Completed',
      color: 'bg-green-100 border-green-200',
      tasks: [],
    },
    {
      id: TaskStatus.CANCELLED,
      title: 'Cancelled',
      color: 'bg-red-100 border-red-200',
      tasks: [],
    },
  ];

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getTasks({ projectId }, 1, 100);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: CreateTaskForm) => {
    try {
      const newTask = await apiClient.createTask({
        ...taskData,
        projectId: projectId || taskData.projectId,
      });
      setTasks(prev => [newTask, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updatedTask = await apiClient.updateTask(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiClient.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      const updatedTask = await apiClient.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task status:', err);
    }

    setActiveTask(null);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
  };

  // Get tasks for each column
  const getColumnTasks = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  // Handle real-time updates
  useEffect(() => {
    socket.on('task:created', (newTask: Task) => {
      if (!projectId || newTask.projectId === projectId) {
        setTasks(prev => [newTask, ...prev]);
      }
    });

    socket.on('task:updated', (updatedTask: Task) => {
      if (!projectId || updatedTask.projectId === projectId) {
        setTasks(prev => prev.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ));
      }
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      setTasks(prev => prev.filter(task => task.id !== id));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [projectId]);

  // Load initial data
  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'text-gray-500';
      case TaskPriority.MEDIUM: return 'text-yellow-600';
      case TaskPriority.HIGH: return 'text-orange-600';
      case TaskPriority.URGENT: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return '●';
      case TaskPriority.MEDIUM: return '●●';
      case TaskPriority.HIGH: return '●●●';
      case TaskPriority.URGENT: return '●●●●';
      default: return '●';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Kanban Board</h2>
        {showCreateButton && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Task
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getColumnTasks(column.id)}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(taskId) => deleteTask(taskId)}
              onTaskSelect={onTaskSelect}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Form */}
      {showCreateForm && (
        <TaskForm
          onSubmit={createTask}
          onCancel={() => setShowCreateForm(false)}
          projectId={projectId}
        />
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => updateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
          projectId={projectId}
        />
      )}
    </div>
  );
};

// Droppable Column Component
interface DroppableColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onTaskSelect?: (task: Task) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onEdit,
  onDelete,
  onTaskSelect,
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border-2 border-dashed ${color} min-h-[500px]`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="px-2 py-1 bg-white rounded-full text-sm font-medium">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.id)}
              onClick={() => onTaskSelect?.(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// Task Card Component
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging = false,
  onEdit,
  onDelete,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'text-gray-500';
      case TaskPriority.MEDIUM: return 'text-yellow-600';
      case TaskPriority.HIGH: return 'text-orange-600';
      case TaskPriority.URGENT: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return '●';
      case TaskPriority.MEDIUM: return '●●';
      case TaskPriority.HIGH: return '●●●';
      case TaskPriority.URGENT: return '●●●●';
      default: return '●';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
          {task.title}
        </h4>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className={getPriorityColor(task.priority)}>
            {getPriorityIcon(task.priority)}
          </span>
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User size={10} />
              <span>{task.assignee.firstName}</span>
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Form Component (reusing from TaskList)
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskForm) => void;
  onCancel: () => void;
  projectId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, projectId }) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: task?.title || '',
    description: task?.description || '',
    projectId: projectId || task?.projectId || '',
    assigneeId: task?.assigneeId || '',
    priority: task?.priority || TaskPriority.MEDIUM,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {task ? 'Edit Task' : 'Create Task'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(TaskPriority).map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {task ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KanbanBoard; 