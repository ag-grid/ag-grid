import { IterableDifferFactory, IterableDiffers } from './differs/iterable_differs';
import { KeyValueDifferFactory, KeyValueDiffers } from './differs/keyvalue_differs';
export { SimpleChanges } from '../metadata/lifecycle_hooks';
export { SimpleChange, UNINITIALIZED, ValueUnwrapper, WrappedValue, devModeEqual, looseIdentical } from './change_detection_util';
export { ChangeDetectorRef } from './change_detector_ref';
export { ChangeDetectionStrategy, ChangeDetectorStatus, isDefaultChangeDetectionStrategy } from './constants';
export { CollectionChangeRecord, DefaultIterableDifferFactory } from './differs/default_iterable_differ';
export { DefaultIterableDiffer } from './differs/default_iterable_differ';
export { DefaultKeyValueDifferFactory, KeyValueChangeRecord } from './differs/default_keyvalue_differ';
export { IterableDiffer, IterableDifferFactory, IterableDiffers, TrackByFn } from './differs/iterable_differs';
export { KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers } from './differs/keyvalue_differs';
export { PipeTransform } from './pipe_transform';
/**
 * Structural diffing for `Object`s and `Map`s.
 */
export declare const keyValDiff: KeyValueDifferFactory[];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
export declare const iterableDiff: IterableDifferFactory[];
export declare const defaultIterableDiffers: IterableDiffers;
export declare const defaultKeyValueDiffers: KeyValueDiffers;
