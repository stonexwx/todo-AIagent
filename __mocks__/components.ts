import { jest } from '@jest/globals';

export const Message = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  loading: jest.fn(),
  destroy: jest.fn()
};

export const mockMessageImplementation = () => {
  Message.success.mockImplementation(jest.fn());
  Message.error.mockImplementation(jest.fn());
};

export const resetMessageMocks = () => {
  Message.success.mockReset();
  Message.error.mockReset();
};