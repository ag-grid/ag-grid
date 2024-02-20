import { BaseProperties } from '../../util/properties';
import { RedrawType } from '../changeDetectable';
export declare class ChangeDetectableProperties extends BaseProperties {
    protected _dirty: RedrawType;
    protected markDirty(_source: any, type?: RedrawType): void;
    markClean(_opts?: {
        force?: boolean;
        recursive?: boolean;
    }): void;
    isDirty(): boolean;
}
