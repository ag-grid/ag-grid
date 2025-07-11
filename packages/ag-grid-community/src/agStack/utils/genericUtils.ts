export function _exists(value: string | null | undefined): value is string;
export function _exists<T>(value: T): value is NonNullable<T>;
export function _exists(value: any): boolean {
    return value != null && value !== '';
}
