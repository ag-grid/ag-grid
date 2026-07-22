/**
 * Resolve a finite number that is greater than or equal to a minimum value.
 * @param value - Candidate runtime value.
 * @param fallback - Value used when the candidate is invalid.
 * @param minimum - Smallest accepted value.
 * @returns Validated numeric value.
 */
export function resolveFiniteNumber(value: number | undefined, fallback: number, minimum = 0): number {
    return value != null && Number.isFinite(value) && value >= minimum ? value : fallback;
}

/**
 * Resolve an optional finite number that is greater than or equal to a minimum value.
 * @param value - Candidate runtime value.
 * @param minimum - Smallest accepted value.
 * @returns Validated numeric value, or `undefined` when invalid or omitted.
 */
export function resolveOptionalFiniteNumber(value: number | undefined, minimum = 0): number | undefined {
    return value != null && Number.isFinite(value) && value >= minimum ? value : undefined;
}
