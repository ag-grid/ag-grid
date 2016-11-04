import { ChangeDetectorRef } from '../change_detector_ref';
import { KeyValueDiffer, KeyValueDifferFactory } from './keyvalue_differs';
export declare class DefaultKeyValueDifferFactory implements KeyValueDifferFactory {
    constructor();
    supports(obj: any): boolean;
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}
export declare class DefaultKeyValueDiffer implements KeyValueDiffer {
    private _records;
    private _mapHead;
    private _previousMapHead;
    private _changesHead;
    private _changesTail;
    private _additionsHead;
    private _additionsTail;
    private _removalsHead;
    private _removalsTail;
    isDirty: boolean;
    forEachItem(fn: (r: KeyValueChangeRecord) => void): void;
    forEachPreviousItem(fn: (r: KeyValueChangeRecord) => void): void;
    forEachChangedItem(fn: (r: KeyValueChangeRecord) => void): void;
    forEachAddedItem(fn: (r: KeyValueChangeRecord) => void): void;
    forEachRemovedItem(fn: (r: KeyValueChangeRecord) => void): void;
    diff(map: Map<any, any> | {
        [k: string]: any;
    }): any;
    onDestroy(): void;
    check(map: Map<any, any> | {
        [k: string]: any;
    }): boolean;
    private _maybeAddToChanges(record, newValue);
    toString(): string;
}
/**
 * @stable
 */
export declare class KeyValueChangeRecord {
    key: any;
    previousValue: any;
    currentValue: any;
    constructor(key: any);
    toString(): string;
}
