import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  invalidate: (key: string) => void;
  clear: () => void;
  getStats: () => { hits: number; misses: number; hitRate: number };
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitContextType {
  checkRateLimit: (userId: string, plan: string) => boolean;
  getRemainingRequests: (userId: string, plan: string) => number;
  resetUserLimits: (userId: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);
const RateLimitContext = createContext<RateLimitContextType | undefined>(undefined);

// Cache Provider
export const CacheProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<Map<string, CacheItem<any>>>(new Map());
  const [stats, setStats] = useState({ hits: 0, misses: 0 });

  // Cleanup expired items every 5 minutes
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map(prev);
        for (const [key, item] of newCache.entries()) {
          if (now - item.timestamp > item.ttl) {
            newCache.delete(key);
          }
        }
        return newCache;
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  const get = <T,>(key: string): T | null => {
    const item = cache.get(key);
    if (!item) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      cache.delete(key);
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return item.data;
  };

  const set = <T,>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    setCache(prev => new Map(prev.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })));
  };

  const invalidate = (key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  };

  const clear = () => {
    setCache(new Map());
    setStats({ hits: 0, misses: 0 });
  };

  const getStats = () => ({
    ...stats,
    hitRate: stats.hits + stats.misses > 0 ? stats.hits / (stats.hits + stats.misses) : 0
  });

  return (
    <CacheContext.Provider value={{ get, set, invalidate, clear, getStats }}>
      {children}
    </CacheContext.Provider>
  );
};

// Rate Limit Provider
export const RateLimitProvider = ({ children }: { children: ReactNode }) => {
  const [rateLimits, setRateLimits] = useState<Map<string, RateLimitEntry>>(new Map());

  const getPlanLimits = (plan: string) => {
    const limits = {
      free: { requests: 10, window: 60 * 60 * 1000 }, // 10 requests per hour
      light: { requests: 100, window: 60 * 60 * 1000 }, // 100 requests per hour
      premium: { requests: 500, window: 60 * 60 * 1000 }, // 500 requests per hour
      'premium-plus': { requests: 1000, window: 60 * 60 * 1000 }, // 1000 requests per hour
      platinum: { requests: 10000, window: 60 * 60 * 1000 } // 10000 requests per hour
    };
    return limits[plan as keyof typeof limits] || limits.free;
  };

  const checkRateLimit = (userId: string, plan: string): boolean => {
    const now = Date.now();
    const { requests, window } = getPlanLimits(plan);
    const key = `${userId}:${plan}`;
    
    const entry = rateLimits.get(key);
    
    // Reset if window expired
    if (!entry || now >= entry.resetTime) {
      setRateLimits(prev => new Map(prev.set(key, {
        count: 1,
        resetTime: now + window
      })));
      return true;
    }

    // Check if under limit
    if (entry.count < requests) {
      setRateLimits(prev => new Map(prev.set(key, {
        ...entry,
        count: entry.count + 1
      })));
      return true;
    }

    return false; // Rate limit exceeded
  };

  const getRemainingRequests = (userId: string, plan: string): number => {
    const { requests } = getPlanLimits(plan);
    const key = `${userId}:${plan}`;
    const entry = rateLimits.get(key);
    
    if (!entry || Date.now() >= entry.resetTime) {
      return requests;
    }
    
    return Math.max(0, requests - entry.count);
  };

  const resetUserLimits = (userId: string) => {
    setRateLimits(prev => {
      const newLimits = new Map(prev);
      for (const key of newLimits.keys()) {
        if (key.startsWith(userId + ':')) {
          newLimits.delete(key);
        }
      }
      return newLimits;
    });
  };

  // Cleanup expired entries every minute
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setRateLimits(prev => {
        const newLimits = new Map(prev);
        for (const [key, entry] of newLimits.entries()) {
          if (now >= entry.resetTime) {
            newLimits.delete(key);
          }
        }
        return newLimits;
      });
    }, 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <RateLimitContext.Provider value={{ checkRateLimit, getRemainingRequests, resetUserLimits }}>
      {children}
    </RateLimitContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
};

export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within RateLimitProvider');
  }
  return context;
};