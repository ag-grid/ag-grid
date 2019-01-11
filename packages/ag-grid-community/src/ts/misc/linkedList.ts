export class LinkedList<T> {

    private first: LinkedListItem<T> = null;
    private last: LinkedListItem<T> = null;

    public add(item: T): void {
        const entry: LinkedListItem<T> = {
            item: item,
            next: null
        };
        if (this.last) {
            this.last.next = entry;
        } else {
            this.first = entry;
        }
        this.last = entry;
    }

    public remove(): T {
        const result = this.first;
        if (result) {
            this.first = result.next;
            if (!this.first) {
                this.last = null;
            }
        }
        return result.item;
    }

    public isEmpty(): boolean {
        return !this.first;
    }
}

class LinkedListItem<T> {
    item: T;
    next: LinkedListItem<T>;
}