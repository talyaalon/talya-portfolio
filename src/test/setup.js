import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia, which BackToTop and the reduced-motion
// checks call.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });
}

// Nor IntersectionObserver, which Reveal uses on every section.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
    unobserve() {}
    disconnect() {}
  };
}
