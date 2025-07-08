export interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export interface Project {
  id: number;
  name: string;
}
