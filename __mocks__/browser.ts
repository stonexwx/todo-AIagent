interface Storage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  store: Record<string, string>;
  key: (index: number) => string | null;
}

const _store: Record<string, string> = {};

export const mockLocalStorage = (): Storage => ({
  store: _store,
  getItem: jest.fn((key) => {
    return _store[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    _store[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete _store[key];
  }),
  clear: jest.fn(() => {
    Object.keys(_store).forEach((key) => delete _store[key]);
  }),
  // 从 Storage 接口中移除 length 属性，因为它不是接口定义的一部分
  key: jest.fn((index) => Object.keys(_store)[index]),
});

export const setupBrowserMocks = () => {
  Object.defineProperty(window, "localStorage", {
    value: {
      ...mockLocalStorage(),
      length: Object.keys(_store).length,
    },
    writable: true,
  });
};
