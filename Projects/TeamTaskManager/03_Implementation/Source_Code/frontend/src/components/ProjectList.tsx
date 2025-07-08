"use client";

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Project } from '@/lib/types';

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    socket.on('project:created', (newProject: Project) => {
      console.log('project created', newProject);
      setProjects((prevProjects) => [...prevProjects, newProject]);
    });

    return () => {
      socket.off('project:created');
    };
  }, []);

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
