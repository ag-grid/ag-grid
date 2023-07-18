export type Has<P extends keyof T, T> = T & { [K in P]-?: T[P] };
