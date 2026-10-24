import '@testing-library/jest-dom/vitest';

// jsdom (the fake browser used in tests) does not implement scrolling,
// so replace window.scrollTo with an empty function.
window.scrollTo = () => {};
