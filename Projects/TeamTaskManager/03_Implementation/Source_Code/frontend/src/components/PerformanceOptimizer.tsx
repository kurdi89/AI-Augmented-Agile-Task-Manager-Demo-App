"use client";

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Task, Project, TaskFilters, ProjectFilters } from '@/lib/types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const cacheManager = new CacheManager();

// Debounce hook
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtual scrolling hook
export const useVirtualScroll = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

// Infinite scroll hook
export const useInfiniteScroll = (
  hasMore: boolean,
  loading: boolean,
  onLoadMore: () => void,
  threshold: number = 100
) => {
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  return lastElementRef;
};

// Memoized data fetching hook
export const useMemoizedData = <T,>(
  fetchFn: () => Promise<T>,
  dependencies: any[],
  cacheKey: string,
  ttl: number = 5 * 60 * 1000
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cached = cacheManager.get<T>(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      cacheManager.set(cacheKey, result, ttl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, ttl]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Optimized search hook
export const useOptimizedSearch = <T,>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  query: string,
  debounceDelay: number = 300
) => {
  const debouncedQuery = useDebounce(query, debounceDelay);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;
    return items.filter(item => searchFn(item, debouncedQuery));
  }, [items, debouncedQuery, searchFn]);

  return filteredItems;
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTime.current;
    
    if (renderTime > 16) { // More than 16ms (60fps threshold)
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    logPerformance: () => {
      console.log(`${componentName} has rendered ${renderCount.current} times`);
    },
  };
};

// Lazy loading component
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}> = ({ children, fallback = <div>Loading...</div>, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

// Optimized list component
export const OptimizedList: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}> = ({ items, renderItem, itemHeight, containerHeight, className }) => {
  const { visibleItems, totalHeight, onScroll } = useVirtualScroll(
    items,
    itemHeight,
    containerHeight
  );

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance optimizer context
const PerformanceContext = React.createContext<{
  cacheManager: CacheManager;
  clearCache: () => void;
}>({
  cacheManager,
  clearCache: () => {},
});

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const clearCache = useCallback(() => {
    cacheManager.clear();
  }, []);

  // Clean up expired cache items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cacheManager.clearExpired();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <PerformanceContext.Provider value={{ cacheManager, clearCache }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformanceContext = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceOptimizer');
  }
  return context;
};

// Optimized task search
export const useOptimizedTaskSearch = (tasks: Task[], query: string) => {
  return useOptimizedSearch(
    tasks,
    (task, searchQuery) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.status.toLowerCase().includes(searchLower) ||
        task.priority.toLowerCase().includes(searchLower)
      );
    },
    query
  );
};

// Optimized project search
export const useOptimizedProjectSearch = (projects: Project[], query: string) => {
  return useOptimizedSearch(
    projects,
    (project, searchQuery) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.status.toLowerCase().includes(searchLower) ||
        (Array.isArray(project.tags) && project.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    },
    query
  );
};

// Image optimization component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, alt, width, height, className }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  if (error) {
    return <div className={`${className} bg-gray-200 flex items-center justify-center`}>Failed to load</div>;
  }

  return (
    <div className={`${className} relative overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
      />
    </div>
  );
};

export default PerformanceOptimizer; 