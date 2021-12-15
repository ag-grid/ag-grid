import { _ } from "@ag-grid-community/core";
import { FilterExpressionSerialiser } from "./interfaces";

export const NO_OP_SERIALISER: FilterExpressionSerialiser<any, any> = {
    toExpression: (i) => i,
    toEvaluationModel: (i) => i,
};

export const DATE_SERIALISER: FilterExpressionSerialiser<Date, string> = {
    toExpression: (input) => {
        return input instanceof Date ? _.serialiseDate(input, false) : null;
    },
    toEvaluationModel: (input) => {
        return input == null ? null : _.parseDateTimeFromString(input);
    },
};
