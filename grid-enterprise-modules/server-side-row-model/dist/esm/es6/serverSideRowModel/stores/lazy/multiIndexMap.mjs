export class MultiIndexMap {
    constructor(...indexes) {
        if (indexes.length < 1) {
            throw new Error('AG Grid: At least one index must be provided.');
        }
        this.indexes = indexes;
        this.maps = new Map(this.indexes.map(index => [index, new Map()]));
    }
    getBy(index, key) {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.get(key);
    }
    set(item) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.set(item[index], item);
        });
    }
    delete(item) {
        this.indexes.forEach(index => {
            const map = this.maps.get(index);
            if (!map) {
                throw new Error(`AG Grid: ${String(index)} not found`);
            }
            map.delete(item[index]);
        });
    }
    clear() {
        this.maps.forEach(map => map.clear());
    }
    getIterator(index) {
        const map = this.maps.get(index);
        if (!map) {
            throw new Error(`AG Grid: ${String(index)} not found`);
        }
        return map.values();
    }
    forEach(callback) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            callback(pointer.value);
        }
    }
    find(callback) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (callback(pointer.value)) {
                return pointer.value;
            }
        }
    }
    filter(predicate) {
        const iterator = this.getIterator(this.indexes[0]);
        let pointer;
        const result = [];
        while (pointer = iterator.next()) {
            if (pointer.done)
                break;
            if (predicate(pointer.value)) {
                result.push(pointer.value);
            }
        }
        return result;
    }
}
