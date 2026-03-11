/**
 * Intersection Observer Polyfill for older browsers
 * Provides fallback support for Safari <12.1 and other older browsers
 */

if (!('IntersectionObserver' in window)) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.elements = new WeakMap();
    }

    observe(element) {
      // Fallback: immediately call callback with isIntersecting = true
      this.elements.set(element, true);
      
      // Simulate intersection by checking if element is in viewport
      const rect = element.getBoundingClientRect();
      const isIntersecting = (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
      );

      this.callback([{
        target: element,
        isIntersecting: isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
        boundingClientRect: rect,
        rootBounds: {
          top: 0,
          left: 0,
          bottom: window.innerHeight,
          right: window.innerWidth,
          width: window.innerWidth,
          height: window.innerHeight
        },
        time: Date.now()
      }]);
    }

    unobserve(element) {
      this.elements.delete(element);
    }

    disconnect() {
      this.elements = new WeakMap();
    }

    takeRecords() {
      return [];
    }
  };
}

export default window.IntersectionObserver;
