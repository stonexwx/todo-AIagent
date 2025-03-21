import { jest } from "@jest/globals";

export const invoke = jest
  .fn<(cmd: string, payload?: unknown) => Promise<unknown>>()
  .mockResolvedValueOnce([])
  .mockName("tauriInvoke");

export const mockSuccessResponse = (data: unknown) => {
  invoke.mockResolvedValueOnce(data as Promise<unknown>);
};

export const mockErrorResponse = (error: string) => {
  invoke.mockRejectedValueOnce(new Error(error) as unknown as Promise<unknown>);
};
