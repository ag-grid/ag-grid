type MakeOptional<T, K extends keyof T> = T extends any
    ? { [P in keyof T as P extends K ? P : never]?: T[P] } & {
          [P in keyof T as P extends K ? never : P]: T[P];
      }
    : never;

export interface TokenRange {
    start: number;
    end: number;
}
