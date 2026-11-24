/**
 * Throws the one error collected as it is, or an `AggregateError` of several; does nothing for none.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _throwErrors(errors: unknown[]): void {
    if (errors.length === 1) {
        throw errors[0];
    }
    if (errors.length > 1) {
        throw new AggregateError(errors);
    }
}
