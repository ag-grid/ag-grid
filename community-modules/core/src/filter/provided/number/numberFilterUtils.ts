import type { NumberFilterParams } from './iNumberFilter';

export function getAllowedCharPattern(filterParams?: NumberFilterParams): string | null {
    const { allowedCharPattern } = filterParams ?? {};

    return allowedCharPattern ?? null;
}
