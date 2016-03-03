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
export class GroupInstanceIdCreator {

    // this map contains keys to numbers, so we remember what the last call was
    private existingIds: any = {};

    public getInstanceIdForKey(key: string): number {
        var lastResult = this.existingIds[key];
        var result: number;
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