export class MultiIndexMap<K> {
    private indexes: (keyof K)[];
    private maps: Map<keyof K, Map<any, K>>;

    constructor(...indexes: (keyof K)[]) {
        if (indexes.length < 1) {
            throw new Error('AG Grid: At least one index must be provided.');
        }
        this.indexes = indexes;
        this.maps = new Map(
            this.indexes.map(index => [index, new Map()])
        );
    }

    public getSize(): number {
        return this.maps.get(this.indexes[0])!.size;
    }

    public getBy(index: keyof K, key: any): K | undefined {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.get(key);
    }

    public set(item: K) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.set(item[index], item);
        });
    }

    public delete(item: K) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.delete(item[index]);
        });
    }

    public clear() {
        this.maps.forEach(map => map.clear());
    }

    private getIterator(index: keyof K) {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.values();
    }
    
    public forEach(callback: (item: K) => void) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer: IteratorResult<K, any>;
        while (pointer = iterator.next()) {
            if (pointer.done) break;
            callback(pointer.value);
        }
    }
    
    public find(callback: (item: K) => boolean) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer: IteratorResult<K, any>;
        while (pointer = iterator.next()) {
            if (pointer.done) break;
            if (callback(pointer.value)) {
                return pointer.value;
            }
        }
    }

    public filter(predicate: (item: K) => boolean) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer: IteratorResult<K, any>;
        const result: K[] = [];
        while (pointer = iterator.next()) {
            if (pointer.done) break;
            if (predicate(pointer.value)) {
                result.push(pointer.value);
            }
        }
        return result;
    }
}