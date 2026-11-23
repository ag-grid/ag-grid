// OPTIMISATION: past this many errors, duplicates are kept rather than paying for a Set.
const MAX_DEDUPLICATED_ERRORS = 1000;

/**
 * Throws the one error collected, or an `AggregateError` of every distinct one; does nothing for none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown[]): void {
    const count = errors.length;
    if (count === 1) {
        throw errors[0];
    }
    if (count > 1) {
        const unique = count > MAX_DEDUPLICATED_ERRORS ? errors : Array.from(new Set(errors));
        throw unique.length === 1 ? unique[0] : new AggregateError(unique);
    }
}
