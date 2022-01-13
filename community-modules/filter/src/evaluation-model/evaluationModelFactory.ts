import { Bean, Autowired, GridOptions, _, IFilterParams } from "@ag-grid-community/core";
import { FilterExpression, FilterEvaluationModel, PartialStateType } from "../interfaces";
import { ScalarComparisonOperationModel } from "./scalarComparisonOperationModel";
import { DEFAULT_COMPARATOR } from "./comparator/defaultComparator";
import { LogicOperationModel } from "./logicOperationModel";
import { TextComparisonOperationModel } from "./textComparisonOperationModel";
import { NullModel } from "./nullModel";
import { DATE_SERIALISER, NO_OP_SERIALISER } from "./serialisers";
import { DATE_COMPARATOR } from "./comparator/dateComparator";
import { Comparator } from "./interfaces";
import { SetOperationModel } from "./setOperationModel";

@Bean('expressionModelFactory')
export class EvaluationModelFactory {
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    public buildEvaluationModel(
        expr: FilterExpression | PartialStateType<FilterExpression> | null,
        filterParams?: IFilterParams,
    ): FilterEvaluationModel<any> {
        if (expr == null) { return new NullModel(); }
        
        switch (expr.type) {
            case "logic":
                // @ts-ignore TS2349
                const operands = expr.operands?.map(o => this.buildEvaluationModel(o, filterParams))!;
                return new LogicOperationModel({
                    ...expr,
                    operands,
                    filterParams,
                });
            case "number-op":
                return new ScalarComparisonOperationModel<number>({
                    ...expr,
                    comparator: DEFAULT_COMPARATOR as Comparator<number>,
                    operandSerialiser: NO_OP_SERIALISER,
                    filterParams,
                });
            case "date-op":
                return new ScalarComparisonOperationModel<Date>({
                    ...expr,
                    comparator: DATE_COMPARATOR,
                    operandSerialiser: DATE_SERIALISER,
                    filterParams,
                });
            case "text-op":
                return new TextComparisonOperationModel({
                    ...expr,
                    filterParams,
                });
            case "set-op":
                return new SetOperationModel({
                    ...expr,
                    comparator: DEFAULT_COMPARATOR as Comparator<string>,
                    filterParams,
                })
            default:
                throw new Error("AG Grid: Unknown expression type: " + expr);
        }
    }
}
