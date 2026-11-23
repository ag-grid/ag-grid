/**
 * Throws an `AggregateError` of the errors collected; does nothing for none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown[]): void {
    if (errors.length) {
        throw new AggregateError(errors);
    }
}
