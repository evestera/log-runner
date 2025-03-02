export type Line = {
  id: number;
  type: "stdout" | "stderr" | "meta";
  level: "info" | "warn" | "error";
  message: string;
  record?: Record<string, unknown>;
  timestamp: Date;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
