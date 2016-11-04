/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as o from '../output/output_ast';
import { ViewType } from '../private_import_core';
export declare class ViewTypeEnum {
    static fromValue(value: ViewType): o.Expression;
}
export declare class ViewEncapsulationEnum {
    static fromValue(value: ViewEncapsulation): o.Expression;
}
export declare class ChangeDetectionStrategyEnum {
    static fromValue(value: ChangeDetectionStrategy): o.Expression;
}
export declare class ChangeDetectorStatusEnum {
    static fromValue(value: ChangeDetectorStatusEnum): o.Expression;
}
export declare class ViewConstructorVars {
    static viewUtils: o.ReadVarExpr;
    static parentInjector: o.ReadVarExpr;
    static declarationEl: o.ReadVarExpr;
}
export declare class ViewProperties {
    static renderer: o.ReadPropExpr;
    static projectableNodes: o.ReadPropExpr;
    static viewUtils: o.ReadPropExpr;
}
export declare class InjectMethodVars {
    static token: o.ReadVarExpr;
    static requestNodeIndex: o.ReadVarExpr;
    static notFoundResult: o.ReadVarExpr;
}
export declare class DetectChangesVars {
    static throwOnChange: o.ReadVarExpr;
    static changes: o.ReadVarExpr;
    static changed: o.ReadVarExpr;
}
