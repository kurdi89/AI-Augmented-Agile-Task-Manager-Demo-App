import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceOptimizer,
  useDebounce,
  useVirtualScroll,
  useInfiniteScroll,
  useMemoizedData,
  useOptimizedSearch,
  usePerformanceMonitor,
  LazyComponent,
  OptimizedList,
  useOptimizedTaskSearch,
  useOptimizedProjectSearch,
  OptimizedImage,
} from '../PerformanceOptimizer';
import { Task, Project, TaskStatus, TaskPriority, ProjectStatus } from '@/lib/types';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  callback,
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => 1000),
  },
});

describe('PerformanceOptimizer', () => {
  test('renders children correctly', () => {
    render(
      <PerformanceOptimizer>
        <div>Test Content</div>
      </PerformanceOptimizer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('useDebounce', () => {
  test('debounces value changes', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      const debouncedValue = useDebounce(value, 100);

      return (
        <div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="input"
          />
          <span data-testid="debounced">{debouncedValue}</span>
        </div>
      );
    };

    render(<TestComponent />);

    const input = screen.getByTestId('input');
    const debounced = screen.getByTestId('debounced');

    fireEvent.change(input, { target: { value: 'a' } });
    expect(debounced).toHaveTextContent('');

    fireEvent.change(input, { target: { value: 'ab' } });
    expect(debounced).toHaveTextContent('');

    await waitFor(() => {
      expect(debounced).toHaveTextContent('ab');
    }, { timeout: 150 });
  });
});

describe('useVirtualScroll', () => {
  test('calculates visible items correctly', () => {
    const TestComponent = () => {
      const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
      const { visibleItems, totalHeight, onScroll } = useVirtualScroll(
        items,
        50,
        200
      );

      return (
        <div onScroll={onScroll} data-testid="container">
          <div style={{ height: totalHeight }}>
            {visibleItems.map(({ item, index }) => (
              <div key={index} data-testid={`item-${index}`}>
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    // Should render only visible items (200/50 = 4 items + 1 buffer = 5 items)
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-4')).toBeInTheDocument();
    expect(screen.queryByTestId('item-5')).not.toBeInTheDocument();
  });
});

describe('useInfiniteScroll', () => {
  test('triggers load more when scrolling to bottom', () => {
    const onLoadMore = jest.fn();
    const TestComponent = () => {
      const lastElementRef = useInfiniteScroll(true, false, onLoadMore);

      return (
        <div>
          <div>Item 1</div>
          <div>Item 2</div>
          <div ref={lastElementRef}>Last Item</div>
        </div>
      );
    };

    render(<TestComponent />);

    // Simulate intersection observer callback
    const mockObserver = global.IntersectionObserver as jest.MockedClass<typeof IntersectionObserver>;
    const mockInstance = mockObserver.mock.instances[0] as any;
    
    mockInstance.callback([{ isIntersecting: true } as IntersectionObserverEntry]);

    expect(onLoadMore).toHaveBeenCalled();
  });
});

describe('useMemoizedData', () => {
  test('caches data and returns cached version', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ data: 'test' });
    
    const TestComponent = () => {
      const { data, loading, error } = useMemoizedData<{ data: string }>(
        fetchFn,
        [],
        'test-key',
        5000
      );

      return (
        <div>
          {loading && <span data-testid="loading">Loading...</span>}
          {error && <span data-testid="error">{error}</span>}
          {data && <span data-testid="data">{data.data}</span>}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toBeInTheDocument();
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});

describe('useOptimizedSearch', () => {
  test('filters items based on search function', () => {
    const items = [
      { name: 'Apple', category: 'fruit' },
      { name: 'Banana', category: 'fruit' },
      { name: 'Carrot', category: 'vegetable' },
    ];

    const TestComponent = () => {
      const [query, setQuery] = React.useState('');
      const filteredItems = useOptimizedSearch(
        items,
        (item, searchQuery) => item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        query
      );

      return (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search"
          />
          {filteredItems.map((item, index) => (
            <div key={index} data-testid={`result-${index}`}>
              {item.name}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    const searchInput = screen.getByTestId('search');
    fireEvent.change(searchInput, { target: { value: 'apple' } });

    expect(screen.getByTestId('result-0')).toHaveTextContent('Apple');
    expect(screen.queryByTestId('result-1')).not.toBeInTheDocument();
  });
});

describe('usePerformanceMonitor', () => {
  test('tracks render count and performance', () => {
    const TestComponent = () => {
      const { renderCount, logPerformance } = usePerformanceMonitor('TestComponent');
      const [count, setCount] = React.useState(0);

      return (
        <div>
          <span data-testid="count">{renderCount}</span>
          <button onClick={() => setCount(count + 1)} data-testid="button">
            Increment
          </button>
          <button onClick={logPerformance} data-testid="log">
            Log Performance
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('count')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('button'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });
});

describe('LazyComponent', () => {
  test('renders fallback initially and content when visible', () => {
    render(
      <LazyComponent fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="content">Actual Content</div>
      </LazyComponent>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});

describe('OptimizedList', () => {
  test('renders virtualized list correctly', () => {
    const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

    render(
      <OptimizedList
        items={items}
        renderItem={(item: string, index: number) => (
          <div key={index} data-testid={`item-${index}`}>
            {item}
          </div>
        )}
        itemHeight={50}
        containerHeight={200}
      />
    );

    // Should only render visible items
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-4')).toBeInTheDocument();
    expect(screen.queryByTestId('item-5')).not.toBeInTheDocument();
  });
});

describe('useOptimizedTaskSearch', () => {
  test('filters tasks based on search query', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Fix login bug',
        description: 'User cannot login',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        createdById: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Add user profile',
        description: 'Create user profile page',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        createdById: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
    ];

    const TestComponent = () => {
      const [query, setQuery] = React.useState('');
      const filteredTasks = useOptimizedTaskSearch(tasks, query);

      return (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search"
          />
          {filteredTasks.map((task, index) => (
            <div key={task.id} data-testid={`task-${index}`}>
              {task.title}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    const searchInput = screen.getByTestId('search');
    fireEvent.change(searchInput, { target: { value: 'login' } });

    expect(screen.getByTestId('task-0')).toHaveTextContent('Fix login bug');
    expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
  });
});

describe('useOptimizedProjectSearch', () => {
  test('filters projects based on search query', () => {
    const projects: Project[] = [
      {
        id: '1',
        name: 'Frontend Development',
        description: 'React application development',
        status: ProjectStatus.ACTIVE,
        tags: ['react', 'typescript'],
        ownerId: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Backend API',
        description: 'Node.js API development',
        status: ProjectStatus.ACTIVE,
        tags: ['nodejs', 'express'],
        ownerId: 'user-1',
        createdAt: '2025-07-01T00:00:00Z',
        updatedAt: '2025-07-01T00:00:00Z',
      },
    ];

    const TestComponent = () => {
      const [query, setQuery] = React.useState('');
      const filteredProjects = useOptimizedProjectSearch(projects, query);

      return (
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search"
          />
          {filteredProjects.map((project, index) => (
            <div key={project.id} data-testid={`project-${index}`}>
              {project.name}
            </div>
          ))}
        </div>
      );
    };

    render(<TestComponent />);

    const searchInput = screen.getByTestId('search');
    fireEvent.change(searchInput, { target: { value: 'frontend' } });

    expect(screen.getByTestId('project-0')).toHaveTextContent('Frontend Development');
    expect(screen.queryByTestId('project-1')).not.toBeInTheDocument();
  });
});

describe('OptimizedImage', () => {
  test('renders loading state initially', () => {
    render(
      <OptimizedImage
        src="test.jpg"
        alt="Test Image"
        width={100}
        height={100}
        data-testid="image"
      />
    );

    expect(screen.getByTestId('image')).toBeInTheDocument();
  });

  test('handles image load success', async () => {
    render(
      <OptimizedImage
        src="test.jpg"
        alt="Test Image"
        width={100}
        height={100}
        data-testid="image"
      />
    );

    const img = screen.getByTestId('image').querySelector('img');
    if (img) {
      fireEvent.load(img);
    }

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  test('handles image load error', async () => {
    render(
      <OptimizedImage
        src="invalid.jpg"
        alt="Test Image"
        width={100}
        height={100}
        data-testid="image"
      />
    );

    const img = screen.getByTestId('image').querySelector('img');
    if (img) {
      fireEvent.error(img);
    }

    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });
}); 