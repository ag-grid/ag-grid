import { Column, ColumnModel, _ } from "@ag-grid-community/core";
import { AdvancedFilterController, FilterUI, InternalFilterController } from "../controllers/interfaces";

export function calculateAffectedColumns(
    beforeState: Record<string, any> | null,
    afterState: Record<string, any> | null,
    columnModel: ColumnModel,
): Column[] {
    const supersetKeys = _.convertToSet(
        Object.keys(beforeState || {}).concat(Object.keys(afterState || {}))
    );

    const result: Column[] = [];

    supersetKeys.forEach((colId) => {
        const before = beforeState ? beforeState[colId] : null;
        const after = afterState ? afterState[colId] : null;

        if (!_.jsonEquals(before, after)) {
            const column = columnModel.getPrimaryColumn(colId);
            if (!column) { return; }

            result.push(column);
        }
    });

    return result;
}

export function findControllerFor(
    column: Column,
    controllers: InternalFilterController[],
): AdvancedFilterController<FilterUI> | undefined {
    for (const controller of controllers) {
        if (controller.type !== 'advanced') { continue; }

        if (controller.isResponsibleFor(column)) {
            return controller;
        }
    }

    return undefined;
}
