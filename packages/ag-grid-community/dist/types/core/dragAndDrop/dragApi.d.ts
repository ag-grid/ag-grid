import type { BeanCollection } from '../context/context';
import type { RowDropZoneEvents, RowDropZoneParams } from '../gridBodyComp/rowDragFeature';
export declare function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void;
export declare function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void;
export declare function getRowDropZoneParams(beans: BeanCollection, events?: RowDropZoneEvents): RowDropZoneParams;
