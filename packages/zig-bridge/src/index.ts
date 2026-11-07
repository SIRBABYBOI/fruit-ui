export interface NativeRequest {
  id: number;
  method: string;
  params: unknown;
}

export interface NativeResponse {
  id: number;
  result?: unknown;
  error?: string;
}

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

type NativeTransport = (message: string) => void;

export class ZigBridge {
  private nextId = 1;

  private pending = new Map<number, PendingRequest>();

  constructor(
    private transport: NativeTransport,
    private timeoutMs = 10000,
  ) {}

  invoke<T>(method: string, params: unknown): Promise<T> {
    const id = this.nextId++;

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);

        reject(new Error(`Native request timed out: ${method}`));
      }, this.timeoutMs);

      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      try {
        this.transport(
          JSON.stringify({ id, method, params } satisfies NativeRequest),
        );
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  recieve(response: NativeResponse): void {
    const request = this.pending.get(response.id);

    if (!request) return;

    clearTimeout(request.timeout);
    this.pending.delete(response.id);

    if (response.error !== undefined) {
      request.reject(new Error(response.error));
    } else {
      request.resolve(response.result);
    }
  }
}
