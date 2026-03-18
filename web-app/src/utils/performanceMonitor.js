// Performance monitoring utilities
class PerformanceMonitor {
  static init() {
    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
  }

  static observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('[Performance] LCP:', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('[Performance] LCP observer not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('[Performance] FID:', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('[Performance] FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('[Performance] CLS:', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('[Performance] CLS observer not supported');
      }
    }
  }

  static observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources (>1s)
            console.warn('[Performance] Slow resource:', entry.name, entry.duration + 'ms');
          }
        });
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('[Performance] Resource observer not supported');
      }
    }
  }

  static observeNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          console.log('[Performance] Navigation timing:', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          });
        }
      }, 0);
    });
  }

  static measureUserTiming(name, fn) {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`[Performance] ${name}:`, measure.duration + 'ms');
    
    return result;
  }
}

// Initialize performance monitoring
PerformanceMonitor.init();

export default PerformanceMonitor;