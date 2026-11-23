/**
 * Throws an `AggregateError` of the error, or of the errors in an array; does nothing for an empty array.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown): void {
    const list = Array.isArray(errors) ? errors : [errors];
    if (list.length) {
        throw new AggregateError(list);
    }
}
