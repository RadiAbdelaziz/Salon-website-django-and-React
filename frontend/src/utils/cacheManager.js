/**
 * Enhanced Cache Management Utility
 * Provides intelligent caching with TTL, LRU eviction, and statistics
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.accessCounts = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
    this.accessCounts.set(key, 1);
  }

  get(key) {
    const expiry = this.timestamps.get(key);
    if (!expiry) return null;
    
    // Check if expired
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    
    // Update access count
    const count = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, count + 1);
    
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.accessCounts.delete(key);
  }

  clear(key = null) {
    if (key) {
      this.delete(key);
    } else {
      this.cache.clear();
      this.timestamps.clear();
      this.accessCounts.clear();
    }
  }

  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessCounts.clear();
  }

  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, timestamp] of this.timestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      oldestItem: this.getOldestItem(),
      mostAccessed: this.getMostAccessed()
    };
  }

  calculateHitRate() {
    const totalAccesses = Array.from(this.accessCounts.values()).reduce((sum, count) => sum + count, 0);
    const uniqueKeys = this.accessCounts.size;
    return uniqueKeys > 0 ? totalAccesses / uniqueKeys : 0;
  }

  getOldestItem() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, timestamp] of this.timestamps) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  getMostAccessed() {
    let mostAccessedKey = null;
    let maxAccesses = 0;
    
    for (const [key, count] of this.accessCounts) {
      if (count > maxAccesses) {
        maxAccesses = count;
        mostAccessedKey = key;
      }
    }
    
    return mostAccessedKey;
  }
}

export const cacheManager = new CacheManager();

// Cache TTL configurations for different data types
export const CACHE_TTL = {
  SERVICES: 10 * 60 * 1000, // 10 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  BOOKINGS: 2 * 60 * 1000, // 2 minutes
  AVAILABILITY: 1 * 60 * 1000, // 1 minute
  STATIC_DATA: 60 * 60 * 1000, // 1 hour
};

export default cacheManager;