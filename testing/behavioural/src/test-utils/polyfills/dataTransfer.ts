class DataTransferItemMock implements DataTransferItem {
    constructor(
        public kind: 'string' | 'file' = 'string',
        public type: string = 'text/plain',
        public value: string | File = ''
    ) {}

    getAsFile(): File | null {
        return this.kind === 'file' && this.value instanceof File ? this.value : null;
    }

    getAsString(callback: (data: string) => void): void {
        if (this.kind === 'string' && typeof this.value === 'string') {
            callback(this.value);
        } else {
            const file = this.getAsFile();
            if (file) {
                void file.text().then((text) => callback(text));
            }
        }
    }

    webkitGetAsEntry(): any {
        return null;
    }
}

class DataTransferItemListMock extends Array<DataTransferItemMock> implements DataTransferItemList {
    add(data: string | File, type?: string): DataTransferItemMock | null {
        const item = new DataTransferItemMock(
            typeof data === 'string' ? 'string' : 'file',
            type || (typeof data === 'string' ? 'text/plain' : data.type),
            data
        );
        this.push(item);
        return item;
    }

    remove(index: number): void {
        this.splice(index, 1);
    }

    clear(): void {
        this.length = 0;
    }
}

class FileListMock extends Array<File> implements FileList {
    constructor(files: File[] = []) {
        super(...files);
    }

    item(index: number): File | null {
        return this[index] || null;
    }

    [Symbol.hasInstance](instance: any): boolean {
        return instance instanceof FileListMock || super[Symbol.hasInstance](instance);
    }
}

class DataTransferMock implements DataTransfer {
    data: Record<string, string> = {};
    dropEffect: DataTransfer['dropEffect'] = 'none';
    effectAllowed: DataTransfer['effectAllowed'] = 'all';
    files = new FileListMock();
    items = new DataTransferItemListMock();
    types: string[] = [];

    setData(format: string, data: string) {
        this.data[format] = data;
        if (!this.types.includes(format)) {
            this.types.push(format);
        }
    }

    getData(format: string) {
        return this.data[format] || '';
    }

    clearData(format?: string) {
        if (format) {
            delete this.data[format];
            this.types = this.types.filter((type) => type !== format);
        } else {
            this.data = {};
            this.types = [];
        }
    }

    setDragImage(_image: Element, _x: number, _y: number): void {}
}

export function initDataTransferPolyfill() {
    window.DataTransferItem ??= DataTransferItemMock;
    window.DataTransferItemList ??= DataTransferItemListMock;
    window.DataTransfer ??= DataTransferMock;
}
