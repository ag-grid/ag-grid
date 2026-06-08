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
    // Per-key counter: remembers the last instance id handed out for each key.
    private readonly existingIds: Record<string, number> = Object.create(null);

    public getInstanceIdForKey(key: string): number {
        const result = (this.existingIds[key] ?? -1) + 1;
        this.existingIds[key] = result;
        return result;
    }
}
