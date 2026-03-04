// class returns unique instance id's for columns.
// eg, the following calls (in this order) will result in:
//
// getInstanceIdForKey('country') => 0
// getInstanceIdForKey('country') => 1
// getInstanceIdForKey('country') => 2
// getInstanceIdForKey('country') => 3
// getInstanceIdForKey('age') => 0
// getInstanceIdForKey('age') => 1
// getInstanceIdForKey('country') => 4
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GroupInstanceIdCreator {
    // this map contains keys to numbers, so we remember what the last call was
    private existingIds: any = {};

    public getInstanceIdForKey(key: string): number {
        const lastResult = this.existingIds[key];
        let result: number;
        if (typeof lastResult !== 'number') {
            // first time this key
            result = 0;
        } else {
            result = lastResult + 1;
        }

        this.existingIds[key] = result;

        return result;
    }
}
