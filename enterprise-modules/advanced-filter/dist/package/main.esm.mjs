// enterprise-modules/advanced-filter/src/advancedFilterModule.ts
import { ModuleNames, _FilterCoreModule } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterApi.ts
function getAdvancedFilterModel(beans) {
  return beans.filterManager?.getAdvancedFilterModel() ?? null;
}
function setAdvancedFilterModel(beans, advancedFilterModel) {
  beans.filterManager?.setAdvancedFilterModel(advancedFilterModel);
}
function showAdvancedFilterBuilder(beans) {
  beans.filterManager?.toggleAdvancedFilterBuilder(true, "api");
}
function hideAdvancedFilterBuilder(beans) {
  beans.filterManager?.toggleAdvancedFilterBuilder(false, "api");
}

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterExpressionService.ts
import { BeanStub, _exists, _parseDateTimeFromString, _serialiseDate, _toStringOrNull } from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterLocaleText.ts
var ADVANCED_FILTER_LOCALE_TEXT = {
  ariaAdvancedFilterBuilderItem: (variableValues) => `${variableValues[0]}. Level ${variableValues[1]}. Press ENTER to edit`,
  ariaAdvancedFilterBuilderItemValidation: (variableValues) => `${variableValues[0]}. Level ${variableValues[1]}. ${variableValues[2]} Press ENTER to edit`,
  ariaAdvancedFilterBuilderList: "Advanced Filter Builder List",
  ariaAdvancedFilterBuilderFilterItem: "Filter Condition",
  ariaAdvancedFilterBuilderGroupItem: "Filter Group",
  ariaAdvancedFilterBuilderColumn: "Column",
  ariaAdvancedFilterBuilderOption: "Option",
  ariaAdvancedFilterBuilderValue: "Value",
  ariaAdvancedFilterBuilderJoinOperator: "Join Operator",
  ariaAdvancedFilterInput: "Advanced Filter Input",
  ariaLabelAdvancedFilterAutocomplete: "Advanced Filter Autocomplete",
  advancedFilterContains: "contains",
  advancedFilterNotContains: "does not contain",
  advancedFilterTextEquals: "equals",
  advancedFilterTextNotEqual: "does not equal",
  advancedFilterStartsWith: "begins with",
  advancedFilterEndsWith: "ends with",
  advancedFilterBlank: "is blank",
  advancedFilterNotBlank: "is not blank",
  advancedFilterEquals: "=",
  advancedFilterNotEqual: "!=",
  advancedFilterGreaterThan: ">",
  advancedFilterGreaterThanOrEqual: ">=",
  advancedFilterLessThan: "<",
  advancedFilterLessThanOrEqual: "<=",
  advancedFilterTrue: "is true",
  advancedFilterFalse: "is false",
  advancedFilterAnd: "AND",
  advancedFilterOr: "OR",
  advancedFilterApply: "Apply",
  advancedFilterBuilder: "Builder",
  advancedFilterValidationMissingColumn: "Column is missing",
  advancedFilterValidationMissingOption: "Option is missing",
  advancedFilterValidationMissingValue: "Value is missing",
  advancedFilterValidationInvalidColumn: "Column not found",
  advancedFilterValidationInvalidOption: "Option not found",
  advancedFilterValidationMissingQuote: "Value is missing an end quote",
  advancedFilterValidationNotANumber: "Value is not a number",
  advancedFilterValidationInvalidDate: "Value is not a valid date",
  advancedFilterValidationMissingCondition: "Condition is missing",
  advancedFilterValidationJoinOperatorMismatch: "Join operators within a condition must be the same",
  advancedFilterValidationInvalidJoinOperator: "Join operator not found",
  advancedFilterValidationMissingEndBracket: "Missing end bracket",
  advancedFilterValidationExtraEndBracket: "Too many end brackets",
  advancedFilterValidationMessage: (variableValues) => `Expression has an error. ${variableValues[0]} - ${variableValues[1]}.`,
  advancedFilterValidationMessageAtEnd: (variableValues) => `Expression has an error. ${variableValues[0]} at end of expression.`,
  advancedFilterBuilderTitle: "Advanced Filter",
  advancedFilterBuilderApply: "Apply",
  advancedFilterBuilderCancel: "Cancel",
  advancedFilterBuilderAddButtonTooltip: "Add Filter or Group",
  advancedFilterBuilderRemoveButtonTooltip: "Remove",
  advancedFilterBuilderMoveUpButtonTooltip: "Move Up",
  advancedFilterBuilderMoveDownButtonTooltip: "Move Down",
  advancedFilterBuilderAddJoin: "Add Group",
  advancedFilterBuilderAddCondition: "Add Filter",
  advancedFilterBuilderSelectColumn: "Select a column",
  advancedFilterBuilderSelectOption: "Select an option",
  advancedFilterBuilderEnterValue: "Enter a value...",
  advancedFilterBuilderValidationAlreadyApplied: "Current filter already applied.",
  advancedFilterBuilderValidationIncomplete: "Not all conditions are complete.",
  advancedFilterBuilderValidationSelectColumn: "Must select a column.",
  advancedFilterBuilderValidationSelectOption: "Must select an option.",
  advancedFilterBuilderValidationEnterValue: "Must enter a value."
};

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionUtils.ts
function getSearchString(value, position, endPosition) {
  if (!value) {
    return "";
  }
  const numChars = endPosition - position;
  return numChars ? value.slice(0, value.length - numChars) : value;
}
function updateExpression(expression, startPosition, endPosition, updatedValuePart, appendSpace, appendQuote, empty) {
  const secondPartStartPosition = endPosition + (!expression.length || empty ? 0 : 1);
  let positionOffset = 0;
  if (appendSpace) {
    if (expression[secondPartStartPosition] === " ") {
      positionOffset = 1;
    } else {
      updatedValuePart += " ";
      if (appendQuote) {
        updatedValuePart += `"`;
      }
    }
  }
  const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(secondPartStartPosition);
  return { updatedValue, updatedPosition: startPosition + updatedValuePart.length + positionOffset };
}
function findStartPosition(expression, position, endPosition) {
  let startPosition = position;
  while (startPosition < endPosition) {
    const char = expression[startPosition];
    if (char !== " ") {
      break;
    }
    startPosition++;
  }
  return startPosition;
}
function findEndPosition(expression, position, includeCloseBracket, isStartPositionUnknown) {
  let endPosition = position;
  let isEmpty = false;
  while (endPosition < expression.length) {
    const char = expression[endPosition];
    if (char === "(") {
      if (isStartPositionUnknown && expression[endPosition - 1] === " ") {
        isEmpty = true;
      } else {
        endPosition = endPosition - 1;
      }
      break;
    } else if (char === " " || includeCloseBracket && char === ")") {
      endPosition = endPosition - 1;
      break;
    }
    endPosition++;
  }
  return { endPosition, isEmpty };
}
function checkAndUpdateExpression(params, userValue, displayValue, endPosition) {
  if (displayValue !== userValue) {
    params.expression = updateExpression(
      params.expression,
      endPosition - userValue.length + 1,
      endPosition,
      displayValue
    ).updatedValue;
  }
}
function escapeQuotes(value) {
  return value.replace(/(['"])/, "\\$1");
}

// enterprise-modules/advanced-filter/src/advancedFilter/colFilterExpressionParser.ts
var ColumnParser = class {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.type = "column";
    this.valid = true;
    this.hasStartChar = false;
    this.hasEndChar = false;
    this.colName = "";
  }
  parse(char, position) {
    if (char === ColFilterExpressionParser.COL_START_CHAR && !this.colName) {
      this.hasStartChar = true;
    } else if (char === ColFilterExpressionParser.COL_END_CHAR && this.hasStartChar) {
      const isMatch = this.parseColumn(false, position);
      if (isMatch) {
        this.hasEndChar = true;
        return false;
      } else {
        this.colName += char;
      }
    } else {
      this.colName += char;
    }
    return void 0;
  }
  getDisplayValue() {
    return (this.hasStartChar ? ColFilterExpressionParser.COL_START_CHAR : "") + this.colName + (this.hasEndChar ? ColFilterExpressionParser.COL_END_CHAR : "");
  }
  getColId() {
    return this.colId;
  }
  complete(position) {
    this.parseColumn(true, position);
  }
  getValidationError() {
    return this.valid ? null : {
      message: this.params.advancedFilterExpressionService.translate(
        "advancedFilterValidationInvalidColumn"
      ),
      startPosition: this.startPosition,
      endPosition: this.endPosition ?? this.params.expression.length - 1
    };
  }
  parseColumn(fromComplete, endPosition) {
    this.endPosition = endPosition;
    const colValue = this.params.advancedFilterExpressionService.getColId(this.colName);
    if (colValue && this.hasStartChar) {
      this.colId = colValue.colId;
      checkAndUpdateExpression(this.params, this.colName, colValue.columnName, endPosition - 1);
      this.colName = colValue.columnName;
      this.column = this.params.columnModel.getColDefCol(this.colId);
      if (this.column) {
        this.baseCellDataType = this.params.dataTypeService?.getBaseDataType(this.column) ?? "text";
        return true;
      }
    }
    if (fromComplete) {
      this.valid = false;
    }
    this.baseCellDataType = "text";
    return false;
  }
};
var OperatorParser = class {
  constructor(params, startPosition, baseCellDataType) {
    this.params = params;
    this.startPosition = startPosition;
    this.baseCellDataType = baseCellDataType;
    this.type = "operator";
    this.valid = true;
    this.expectedNumOperands = 0;
    this.operator = "";
  }
  parse(char, position) {
    if (char === " " || char === ")") {
      const isMatch = this.parseOperator(false, position - 1);
      if (isMatch) {
        return true;
      } else {
        this.operator += char;
      }
    } else {
      this.operator += char;
    }
    return void 0;
  }
  complete(position) {
    this.parseOperator(true, position);
  }
  getValidationError() {
    return this.valid ? null : {
      message: this.params.advancedFilterExpressionService.translate(
        "advancedFilterValidationInvalidOption"
      ),
      startPosition: this.startPosition,
      endPosition: this.endPosition ?? this.params.expression.length - 1
    };
  }
  getDisplayValue() {
    return this.operator;
  }
  getOperatorKey() {
    return this.parsedOperator;
  }
  parseOperator(fromComplete, endPosition) {
    const operatorForType = this.params.advancedFilterExpressionService.getDataTypeExpressionOperator(
      this.baseCellDataType
    );
    const parsedOperator = operatorForType.findOperator(this.operator);
    this.endPosition = endPosition;
    if (parsedOperator) {
      this.parsedOperator = parsedOperator;
      const operator = operatorForType.operators[parsedOperator];
      this.expectedNumOperands = operator.numOperands;
      const operatorDisplayValue = operator.displayValue;
      checkAndUpdateExpression(this.params, this.operator, operatorDisplayValue, endPosition);
      this.operator = operatorDisplayValue;
      return true;
    }
    const isPartialMatch = parsedOperator === null;
    if (fromComplete || !isPartialMatch) {
      this.valid = false;
    }
    return false;
  }
};
var OperandParser = class {
  constructor(params, startPosition, baseCellDataType, column) {
    this.params = params;
    this.startPosition = startPosition;
    this.baseCellDataType = baseCellDataType;
    this.column = column;
    this.type = "operand";
    this.valid = true;
    this.operand = "";
    this.validationMessage = null;
  }
  parse(char, position) {
    if (char === " ") {
      if (this.quotes) {
        this.operand += char;
      } else {
        this.parseOperand(false, position);
        return true;
      }
    } else if (char === ")") {
      if (this.baseCellDataType === "number" || !this.quotes) {
        this.parseOperand(false, position - 1);
        return true;
      } else {
        this.operand += char;
      }
    } else if (!this.operand && !this.quotes && (char === `'` || char === `"`)) {
      this.quotes = char;
    } else if (this.quotes && char === this.quotes) {
      this.parseOperand(false, position);
      return false;
    } else {
      this.operand += char;
    }
    return void 0;
  }
  complete(position) {
    this.parseOperand(true, position);
  }
  getValidationError() {
    return this.validationMessage ? {
      message: this.validationMessage,
      startPosition: this.startPosition,
      endPosition: this.endPosition ?? this.params.expression.length - 1
    } : null;
  }
  getRawValue() {
    return this.operand;
  }
  getModelValue() {
    return this.modelValue;
  }
  parseOperand(fromComplete, position) {
    const { advancedFilterExpressionService } = this.params;
    this.endPosition = position;
    this.modelValue = this.operand;
    if (fromComplete && this.quotes) {
      this.valid = false;
      this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationMissingQuote");
    } else if (this.modelValue === "") {
      this.valid = false;
      this.validationMessage = advancedFilterExpressionService.translate("advancedFilterValidationMissingValue");
    } else {
      const modelValue = advancedFilterExpressionService.getOperandModelValue(
        this.operand,
        this.baseCellDataType,
        this.column
      );
      if (modelValue != null) {
        this.modelValue = modelValue;
      }
      switch (this.baseCellDataType) {
        case "number":
          if (this.quotes || isNaN(this.modelValue)) {
            this.valid = false;
            this.validationMessage = advancedFilterExpressionService.translate(
              "advancedFilterValidationNotANumber"
            );
          }
          break;
        case "date":
        case "dateString":
          if (modelValue == null) {
            this.valid = false;
            this.validationMessage = advancedFilterExpressionService.translate(
              "advancedFilterValidationInvalidDate"
            );
          }
          break;
      }
    }
  }
};
var ColFilterExpressionParser = class {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.isAwaiting = true;
  }
  parseExpression() {
    let i = this.startPosition;
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === " " && this.isAwaiting) {
      } else {
        this.isAwaiting = false;
        if (!this.parser) {
          let parser;
          if (!this.columnParser) {
            this.columnParser = new ColumnParser(this.params, i);
            parser = this.columnParser;
          } else if (!this.operatorParser) {
            this.operatorParser = new OperatorParser(this.params, i, this.columnParser.baseCellDataType);
            parser = this.operatorParser;
          } else {
            this.operandParser = new OperandParser(
              this.params,
              i,
              this.columnParser.baseCellDataType,
              this.columnParser.column
            );
            parser = this.operandParser;
          }
          this.parser = parser;
        }
        const hasCompletedOnPrevChar = this.parser.parse(char, i);
        if (hasCompletedOnPrevChar != null) {
          if (this.isComplete()) {
            return this.returnEndPosition(hasCompletedOnPrevChar ? i - 1 : i, true);
          }
          this.parser = void 0;
          this.isAwaiting = true;
        }
      }
      i++;
    }
    this.parser?.complete?.(i - 1);
    return this.returnEndPosition(i);
  }
  isValid() {
    return this.isComplete() && this.columnParser.valid && this.operatorParser.valid && (!this.operandParser || this.operandParser.valid);
  }
  getValidationError() {
    const validationError = this.columnParser?.getValidationError() ?? this.operatorParser?.getValidationError() ?? this.operandParser?.getValidationError();
    if (validationError) {
      return validationError;
    }
    const endPosition = this.params.expression.length;
    let translateKey;
    if (!this.columnParser) {
      translateKey = "advancedFilterValidationMissingColumn";
    } else if (!this.operatorParser) {
      translateKey = "advancedFilterValidationMissingOption";
    } else if (this.operatorParser.expectedNumOperands && !this.operandParser) {
      translateKey = "advancedFilterValidationMissingValue";
    }
    if (translateKey) {
      return {
        message: this.params.advancedFilterExpressionService.translate(translateKey),
        startPosition: endPosition,
        endPosition
      };
    }
    return null;
  }
  getFunctionString(params) {
    return this.getFunctionCommon(params, (operandIndex, operatorIndex, colId, evaluatorParamsIndex) => {
      const escapedColId = escapeQuotes(colId);
      const operand = operandIndex == null ? "" : `, params.operands[${operandIndex}]`;
      return `params.operators[${operatorIndex}].evaluator(expressionProxy.getValue('${escapedColId}', node), node, params.evaluatorParams[${evaluatorParamsIndex}]${operand})`;
    });
  }
  getFunctionParsed(params) {
    return this.getFunctionCommon(params, (operandIndex, operatorIndex, colId, evaluatorParamsIndex) => {
      return (expressionProxy, node, p) => p.operators[operatorIndex].evaluator(
        expressionProxy.getValue(colId, node),
        node,
        p.evaluatorParams[evaluatorParamsIndex],
        operandIndex == null ? void 0 : p.operands[operandIndex]
      );
    });
  }
  getAutocompleteListParams(position) {
    if (this.isColumnPosition(position)) {
      return this.getColumnAutocompleteListParams(position);
    }
    if (this.isOperatorPosition(position)) {
      return this.getOperatorAutocompleteListParams(position);
    }
    if (this.isBeyondEndPosition(position)) {
      return void 0;
    }
    return { enabled: false };
  }
  updateExpression(position, updateEntry, type) {
    const { expression } = this.params;
    if (this.isColumnPosition(position)) {
      return updateExpression(
        this.params.expression,
        this.startPosition,
        this.columnParser?.getColId() ? this.columnParser.endPosition : findEndPosition(expression, position).endPosition,
        this.params.advancedFilterExpressionService.getColumnValue(updateEntry),
        true
      );
    } else if (this.isOperatorPosition(position)) {
      const baseCellDataType = this.getBaseCellDataTypeFromOperatorAutocompleteType(type);
      const hasOperand = this.hasOperand(baseCellDataType, updateEntry.key);
      const doesOperandNeedQuotes = hasOperand && this.doesOperandNeedQuotes(baseCellDataType);
      let update;
      if (this.operatorParser?.startPosition != null && position < this.operatorParser.startPosition) {
        update = updateExpression(
          expression,
          position,
          position,
          updateEntry.displayValue ?? updateEntry.key,
          hasOperand,
          doesOperandNeedQuotes
        );
      } else {
        let endPosition;
        let empty = false;
        if (this.operatorParser?.getOperatorKey()) {
          endPosition = this.operatorParser.endPosition;
        } else {
          const { endPosition: calculatedEndPosition, isEmpty } = findEndPosition(
            expression,
            position,
            true,
            true
          );
          endPosition = calculatedEndPosition;
          empty = isEmpty;
        }
        update = updateExpression(
          expression,
          findStartPosition(expression, this.columnParser.endPosition + 1, endPosition),
          endPosition,
          updateEntry.displayValue ?? updateEntry.key,
          hasOperand,
          doesOperandNeedQuotes,
          empty
        );
      }
      return { ...update, hideAutocomplete: !hasOperand };
    }
    return null;
  }
  getModel() {
    const colId = this.columnParser.getColId();
    const model = {
      filterType: this.columnParser.baseCellDataType,
      colId,
      type: this.operatorParser.getOperatorKey()
    };
    if (this.operatorParser.expectedNumOperands) {
      model.filter = this.operandParser.getModelValue();
    }
    return model;
  }
  getFunctionCommon(params, processFunc) {
    const colId = this.columnParser.getColId();
    const operator = this.operatorParser?.getOperatorKey();
    const { operators, evaluatorParams, operands } = params;
    const operatorForColumn = this.params.advancedFilterExpressionService.getExpressionOperator(
      this.columnParser.baseCellDataType,
      operator
    );
    const operatorIndex = this.addToListAndGetIndex(operators, operatorForColumn);
    const evaluatorParamsForColumn = this.params.advancedFilterExpressionService.getExpressionEvaluatorParams(colId);
    const evaluatorParamsIndex = this.addToListAndGetIndex(evaluatorParams, evaluatorParamsForColumn);
    const operandIndex = this.operatorParser?.expectedNumOperands === 0 ? void 0 : this.addToListAndGetIndex(operands, this.getOperandValue());
    return processFunc(operandIndex, operatorIndex, colId, evaluatorParamsIndex);
  }
  getOperandValue() {
    let operand = this.operandParser.getRawValue();
    const { baseCellDataType, column } = this.columnParser;
    switch (baseCellDataType) {
      case "number":
        operand = Number(operand);
        break;
      case "date":
      case "dateString":
        operand = this.params.valueService.parseValue(column, null, operand, void 0);
        break;
    }
    if (baseCellDataType === "dateString") {
      const { dataTypeService } = this.params;
      return dataTypeService ? dataTypeService.getDateParserFunction(column)(operand) : operand;
    }
    return operand;
  }
  isComplete() {
    return !!(this.operatorParser && (!this.operatorParser.expectedNumOperands || this.operatorParser.expectedNumOperands && this.operandParser));
  }
  isColumnPosition(position) {
    return !this.columnParser || this.columnParser.endPosition == null || position <= this.columnParser.endPosition + 1;
  }
  isOperatorPosition(position) {
    return !this.operatorParser || this.operatorParser.endPosition == null || position <= this.operatorParser.endPosition + 1;
  }
  isBeyondEndPosition(position) {
    return this.isComplete() && this.endPosition != null && position > this.endPosition + 1 && this.endPosition + 1 < this.params.expression.length;
  }
  returnEndPosition(returnPosition, treatAsEnd) {
    this.endPosition = treatAsEnd ? returnPosition : returnPosition - 1;
    return returnPosition;
  }
  getColumnAutocompleteListParams(position) {
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getColumnAutocompleteEntries(),
      "column",
      this.getColumnSearchString(position)
    );
  }
  getColumnSearchString(position) {
    const columnName = this.columnParser?.getDisplayValue() ?? "";
    const searchString = getSearchString(
      columnName,
      position,
      this.columnParser?.endPosition == null ? this.params.expression.length : this.columnParser.endPosition + 1
    );
    const containsStartChar = this.columnParser?.hasStartChar && searchString.length > 0;
    const containsEndChar = this.columnParser?.hasEndChar && searchString.length === columnName.length + 2;
    if (containsStartChar) {
      return searchString.slice(1, containsEndChar ? -1 : void 0);
    }
    return searchString;
  }
  getOperatorAutocompleteListParams(position) {
    const column = this.columnParser?.column;
    if (!column) {
      return { enabled: false };
    }
    const baseCellDataType = this.columnParser.baseCellDataType;
    const searchString = this.operatorParser?.startPosition != null && position < this.operatorParser.startPosition ? "" : getSearchString(
      this.operatorParser?.getDisplayValue() ?? "",
      position,
      this.operatorParser?.endPosition == null ? this.params.expression.length : this.operatorParser.endPosition + 1
    );
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getOperatorAutocompleteEntries(column, baseCellDataType),
      `operator-${baseCellDataType}`,
      searchString
    );
  }
  getBaseCellDataTypeFromOperatorAutocompleteType(type) {
    return type?.replace("operator-", "");
  }
  hasOperand(baseCellDataType, operator) {
    return !baseCellDataType || !operator || (this.params.advancedFilterExpressionService.getExpressionOperator(baseCellDataType, operator)?.numOperands ?? 0) > 0;
  }
  doesOperandNeedQuotes(baseCellDataType) {
    return baseCellDataType !== "number";
  }
  addToListAndGetIndex(list, value) {
    const index = list.length;
    list.push(value);
    return index;
  }
};
ColFilterExpressionParser.COL_START_CHAR = "[";
ColFilterExpressionParser.COL_END_CHAR = "]";

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionOperators.ts
function findMatch(searchValue, values, getDisplayValue) {
  let partialMatch = false;
  const searchValueLowerCase = searchValue.toLocaleLowerCase();
  const partialSearchValue = searchValueLowerCase + " ";
  const parsedValue = Object.entries(values).find(([, value]) => {
    const displayValueLowerCase = getDisplayValue(value).toLocaleLowerCase();
    if (displayValueLowerCase.startsWith(partialSearchValue)) {
      partialMatch = true;
    }
    return displayValueLowerCase === searchValueLowerCase;
  });
  if (parsedValue) {
    return parsedValue[0];
  } else if (partialMatch) {
    return null;
  } else {
    return void 0;
  }
}
function getEntries(operators, activeOperatorKeys) {
  const keys = activeOperatorKeys ?? Object.keys(operators);
  return keys.map((key) => ({
    key,
    displayValue: operators[key].displayValue
  }));
}
var TextFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate } = this.params;
    this.operators = {
      contains: {
        displayValue: translate("advancedFilterContains"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.includes(o)),
        numOperands: 1
      },
      notContains: {
        displayValue: translate("advancedFilterNotContains"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, true, (v, o) => !v.includes(o)),
        numOperands: 1
      },
      equals: {
        displayValue: translate("advancedFilterTextEquals"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v === o),
        numOperands: 1
      },
      notEqual: {
        displayValue: translate("advancedFilterTextNotEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, true, (v, o) => v != o),
        numOperands: 1
      },
      startsWith: {
        displayValue: translate("advancedFilterStartsWith"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.startsWith(o)),
        numOperands: 1
      },
      endsWith: {
        displayValue: translate("advancedFilterEndsWith"),
        evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1, false, (v, o) => v.endsWith(o)),
        numOperands: 1
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null || typeof value === "string" && value.trim().length === 0,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null && (typeof value !== "string" || value.trim().length > 0),
        numOperands: 0
      }
    };
  }
  evaluateExpression(value, node, params, operand, nullsMatch, expression) {
    if (value == null) {
      return nullsMatch;
    }
    return params.caseSensitive ? expression(params.valueConverter(value, node), operand) : expression(params.valueConverter(value, node).toLocaleLowerCase(), operand.toLocaleLowerCase());
  }
};
var ScalarFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate, equals } = this.params;
    this.operators = {
      equals: {
        displayValue: translate("advancedFilterEquals"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInEquals,
          equals
        ),
        numOperands: 1
      },
      notEqual: {
        displayValue: translate("advancedFilterNotEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInEquals,
          (v, o) => !equals(v, o)
        ),
        numOperands: 1
      },
      greaterThan: {
        displayValue: translate("advancedFilterGreaterThan"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInGreaterThan,
          (v, o) => v > o
        ),
        numOperands: 1
      },
      greaterThanOrEqual: {
        displayValue: translate("advancedFilterGreaterThanOrEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInGreaterThan,
          (v, o) => v >= o
        ),
        numOperands: 1
      },
      lessThan: {
        displayValue: translate("advancedFilterLessThan"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInLessThan,
          (v, o) => v < o
        ),
        numOperands: 1
      },
      lessThanOrEqual: {
        displayValue: translate("advancedFilterLessThanOrEqual"),
        evaluator: (value, node, params, operand1) => this.evaluateSingleOperandExpression(
          value,
          node,
          params,
          operand1,
          !!params.includeBlanksInLessThan,
          (v, o) => v <= o
        ),
        numOperands: 1
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null,
        numOperands: 0
      }
    };
  }
  evaluateSingleOperandExpression(value, node, params, operand, nullsMatch, expression) {
    if (value == null) {
      return nullsMatch;
    }
    return expression(params.valueConverter(value, node), operand);
  }
};
var BooleanFilterExpressionOperators = class {
  constructor(params) {
    this.params = params;
    this.initOperators();
  }
  getEntries(activeOperators) {
    return getEntries(this.operators, activeOperators);
  }
  findOperator(displayValue) {
    return findMatch(displayValue, this.operators, ({ displayValue: displayValue2 }) => displayValue2);
  }
  initOperators() {
    const { translate } = this.params;
    this.operators = {
      true: {
        displayValue: translate("advancedFilterTrue"),
        evaluator: (value) => !!value,
        numOperands: 0
      },
      false: {
        displayValue: translate("advancedFilterFalse"),
        evaluator: (value) => value === false,
        numOperands: 0
      },
      blank: {
        displayValue: translate("advancedFilterBlank"),
        evaluator: (value) => value == null,
        numOperands: 0
      },
      notBlank: {
        displayValue: translate("advancedFilterNotBlank"),
        evaluator: (value) => value != null,
        numOperands: 0
      }
    };
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterExpressionService.ts
var AdvancedFilterExpressionService = class extends BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "advancedFilterExpressionService";
    this.columnNameToIdMap = {};
    this.columnAutocompleteEntries = null;
    this.expressionEvaluatorParams = {};
  }
  wireBeans(beans) {
    this.valueService = beans.valueService;
    this.columnModel = beans.columnModel;
    this.columnNameService = beans.columnNameService;
    this.dataTypeService = beans.dataTypeService;
  }
  postConstruct() {
    this.expressionJoinOperators = this.generateExpressionJoinOperators();
    this.expressionOperators = this.generateExpressionOperators();
  }
  parseJoinOperator(model) {
    const { type } = model;
    return this.expressionJoinOperators[type] ?? type;
  }
  getColumnDisplayValue(model) {
    const { colId } = model;
    const columnEntries = this.getColumnAutocompleteEntries();
    const columnEntry = columnEntries.find(({ key }) => key === colId);
    let columnName;
    if (columnEntry) {
      columnName = columnEntry.displayValue;
      this.columnNameToIdMap[columnName.toLocaleUpperCase()] = { colId, columnName };
    } else {
      columnName = colId;
    }
    return columnName;
  }
  getOperatorDisplayValue(model) {
    return this.getExpressionOperator(model.filterType, model.type)?.displayValue ?? model.type;
  }
  getOperandModelValue(operand, baseCellDataType, column) {
    switch (baseCellDataType) {
      case "number":
        return _exists(operand) ? Number(operand) : null;
      case "date":
        return _serialiseDate(this.valueService.parseValue(column, null, operand, void 0), false);
      case "dateString": {
        const parsedDateString = this.valueService.parseValue(column, null, operand, void 0);
        return this.dataTypeService ? _serialiseDate(
          this.dataTypeService.getDateParserFunction(column)(parsedDateString) ?? null,
          false
        ) : parsedDateString;
      }
    }
    return operand;
  }
  getOperandDisplayValue(model, skipFormatting) {
    const { colId, filter } = model;
    const column = this.columnModel.getColDefCol(colId);
    let operand = "";
    if (filter != null) {
      let operand1;
      switch (model.filterType) {
        case "number":
          operand1 = _toStringOrNull(filter) ?? "";
          break;
        case "date": {
          const dateValue = _parseDateTimeFromString(filter);
          operand1 = column ? this.valueService.formatValue(column, null, dateValue) : null;
          break;
        }
        case "dateString": {
          let dateStringStringValue;
          if (this.dataTypeService) {
            const dateStringDateValue = _parseDateTimeFromString(filter);
            dateStringStringValue = column ? this.dataTypeService?.getDateFormatterFunction(column)(dateStringDateValue ?? void 0) : null;
          } else {
            dateStringStringValue = filter;
          }
          operand1 = column ? this.valueService.formatValue(column, null, dateStringStringValue) : null;
          break;
        }
      }
      if (model.filterType !== "number") {
        operand1 = operand1 ?? _toStringOrNull(filter) ?? "";
        if (!skipFormatting) {
          operand1 = `"${operand1}"`;
        }
      }
      operand = skipFormatting ? operand1 : ` ${operand1}`;
    }
    return operand;
  }
  parseColumnFilterModel(model) {
    const columnName = this.getColumnDisplayValue(model) ?? "";
    const operator = this.getOperatorDisplayValue(model) ?? "";
    const operands = this.getOperandDisplayValue(model);
    return `[${columnName}] ${operator}${operands}`;
  }
  updateAutocompleteCache(updateEntry, type) {
    if (type === "column") {
      const { key: colId, displayValue } = updateEntry;
      this.columnNameToIdMap[updateEntry.displayValue.toLocaleUpperCase()] = {
        colId,
        columnName: displayValue
      };
    }
  }
  translate(key, variableValues) {
    let defaultValue = ADVANCED_FILTER_LOCALE_TEXT[key];
    if (typeof defaultValue === "function") {
      defaultValue = defaultValue(variableValues);
    }
    return this.localeService.getLocaleTextFunc()(key, defaultValue, variableValues);
  }
  generateAutocompleteListParams(entries, type, searchString) {
    return {
      enabled: true,
      type,
      searchString,
      entries
    };
  }
  getColumnAutocompleteEntries() {
    if (this.columnAutocompleteEntries) {
      return this.columnAutocompleteEntries;
    }
    const columns = this.columnModel.getColDefCols() ?? [];
    const entries = [];
    const includeHiddenColumns = this.gos.get("includeHiddenColumnsInAdvancedFilter");
    columns.forEach((column) => {
      if (column.getColDef().filter && (includeHiddenColumns || column.isVisible() || column.isRowGroupActive())) {
        entries.push({
          key: column.getColId(),
          displayValue: this.columnNameService.getDisplayNameForColumn(column, "advancedFilter")
        });
      }
    });
    entries.sort((a, b) => {
      const aValue = a.displayValue ?? "";
      const bValue = b.displayValue ?? "";
      if (aValue < bValue) {
        return -1;
      } else if (bValue > aValue) {
        return 1;
      }
      return 0;
    });
    return entries;
  }
  getOperatorAutocompleteEntries(column, baseCellDataType) {
    const activeOperators = this.getActiveOperators(column);
    return this.getDataTypeExpressionOperator(baseCellDataType).getEntries(activeOperators);
  }
  getJoinOperatorAutocompleteEntries() {
    return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({ key, displayValue }));
  }
  getDefaultAutocompleteListParams(searchString) {
    return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), "column", searchString);
  }
  getDataTypeExpressionOperator(baseCellDataType) {
    return this.expressionOperators[baseCellDataType];
  }
  getExpressionOperator(baseCellDataType, operator) {
    return this.getDataTypeExpressionOperator(baseCellDataType)?.operators?.[operator];
  }
  getExpressionJoinOperators() {
    return this.expressionJoinOperators;
  }
  getColId(columnName) {
    const upperCaseColumnName = columnName.toLocaleUpperCase();
    const cachedColId = this.columnNameToIdMap[upperCaseColumnName];
    if (cachedColId) {
      return cachedColId;
    }
    const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
    const colEntry = columnAutocompleteEntries.find(
      ({ displayValue }) => displayValue.toLocaleUpperCase() === upperCaseColumnName
    );
    if (colEntry) {
      const { key: colId, displayValue } = colEntry;
      const colValue = { colId, columnName: displayValue };
      this.columnNameToIdMap[upperCaseColumnName] = colValue;
      return colValue;
    }
    return null;
  }
  getExpressionEvaluatorParams(colId) {
    let params = this.expressionEvaluatorParams[colId];
    if (params) {
      return params;
    }
    const column = this.columnModel.getColDefCol(colId);
    if (!column) {
      return { valueConverter: (v) => v };
    }
    const baseCellDataType = this.dataTypeService?.getBaseDataType(column);
    switch (baseCellDataType) {
      case "dateString":
        params = {
          valueConverter: this.dataTypeService?.getDateParserFunction(column) ?? ((v) => v)
        };
        break;
      case "object":
        if (column.getColDef().filterValueGetter) {
          params = { valueConverter: (v) => v };
        } else {
          params = {
            valueConverter: (value, node) => this.valueService.formatValue(column, node, value) ?? (typeof value.toString === "function" ? value.toString() : "")
          };
        }
        break;
      case "text":
      case void 0:
        params = { valueConverter: (v) => _toStringOrNull(v) };
        break;
      default:
        params = { valueConverter: (v) => v };
        break;
    }
    const { filterParams } = column.getColDef();
    if (filterParams) {
      ["caseSensitive", "includeBlanksInEquals", "includeBlanksInLessThan", "includeBlanksInGreaterThan"].forEach(
        (param) => {
          const paramValue = filterParams[param];
          if (paramValue) {
            params[param] = paramValue;
          }
        }
      );
    }
    this.expressionEvaluatorParams[colId] = params;
    return params;
  }
  getColumnDetails(colId) {
    const column = this.columnModel.getColDefCol(colId) ?? void 0;
    const baseCellDataType = (column ? this.dataTypeService?.getBaseDataType(column) : void 0) ?? "text";
    return { column, baseCellDataType };
  }
  generateExpressionOperators() {
    const translate = (key, variableValues) => this.translate(key, variableValues);
    return {
      text: new TextFilterExpressionOperators({ translate }),
      boolean: new BooleanFilterExpressionOperators({ translate }),
      object: new TextFilterExpressionOperators({ translate }),
      number: new ScalarFilterExpressionOperators({ translate, equals: (v, o) => v === o }),
      date: new ScalarFilterExpressionOperators({
        translate,
        equals: (v, o) => v.getTime() === o.getTime()
      }),
      dateString: new ScalarFilterExpressionOperators({
        translate,
        equals: (v, o) => v.getTime() === o.getTime()
      })
    };
  }
  getColumnValue({ displayValue }) {
    return `${ColFilterExpressionParser.COL_START_CHAR}${displayValue}${ColFilterExpressionParser.COL_END_CHAR}`;
  }
  generateExpressionJoinOperators() {
    return {
      AND: this.translate("advancedFilterAnd"),
      OR: this.translate("advancedFilterOr")
    };
  }
  getActiveOperators(column) {
    const filterOptions = column.getColDef().filterParams?.filterOptions;
    if (!filterOptions) {
      return void 0;
    }
    const isValid = filterOptions.every((filterOption) => typeof filterOption === "string");
    return isValid ? filterOptions : void 0;
  }
  resetColumnCaches() {
    this.columnAutocompleteEntries = null;
    this.columnNameToIdMap = {};
    this.expressionEvaluatorParams = {};
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterService.ts
import { BeanStub as BeanStub5, _exists as _exists7, _warnOnce } from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterCtrl.ts
import { BeanStub as BeanStub4, _getAbsoluteHeight, _getAbsoluteWidth, _removeFromParent as _removeFromParent2 } from "@ag-grid-community/core";
import { AgDialog } from "@ag-grid-enterprise/core";

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterComp.ts
import { Component as Component3, RefPlaceholder as RefPlaceholder3, _createIconNoSpan, _makeNull as _makeNull2, _setDisabled } from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/autocomplete/agAutocomplete.ts
import { AgInputTextFieldSelector, Component as Component2, KeyCode as KeyCode2, RefPlaceholder as RefPlaceholder2, _makeNull } from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/autocomplete/agAutocompleteList.ts
import { KeyCode, PopupComponent, RefPlaceholder, _exists as _exists3, _fuzzySuggestions } from "@ag-grid-community/core";
import { VirtualList } from "@ag-grid-enterprise/core";

// enterprise-modules/advanced-filter/src/advancedFilter/autocomplete/agAutocompleteRow.ts
import { Component, _escapeString, _exists as _exists2 } from "@ag-grid-community/core";
var AgAutocompleteRow = class extends Component {
  constructor() {
    super(
      /* html */
      `
        <div class="ag-autocomplete-row" role="presentation">
            <div class="ag-autocomplete-row-label"></div>
        </div>`
    );
    this.hasHighlighting = false;
  }
  setState(value, selected) {
    this.value = value;
    this.render();
    this.updateSelected(selected);
  }
  updateSelected(selected) {
    this.addOrRemoveCssClass("ag-autocomplete-row-selected", selected);
  }
  setSearchString(searchString) {
    let keepHighlighting = false;
    if (_exists2(searchString)) {
      const index = this.value?.toLocaleLowerCase().indexOf(searchString.toLocaleLowerCase());
      if (index >= 0) {
        keepHighlighting = true;
        this.hasHighlighting = true;
        const highlightEndIndex = index + searchString.length;
        const startPart = _escapeString(this.value.slice(0, index));
        const highlightedPart = _escapeString(this.value.slice(index, highlightEndIndex));
        const endPart = _escapeString(this.value.slice(highlightEndIndex));
        this.getGui().lastElementChild.innerHTML = `${startPart}<b>${highlightedPart}</b>${endPart}`;
      }
    }
    if (!keepHighlighting && this.hasHighlighting) {
      this.hasHighlighting = false;
      this.render();
    }
  }
  render() {
    this.getGui().lastElementChild.innerHTML = _escapeString(this.value) ?? "&nbsp;";
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/autocomplete/agAutocompleteList.ts
var AgAutocompleteList = class extends PopupComponent {
  constructor(params) {
    super(
      /* html */
      `<div class="ag-autocomplete-list-popup">
            <div data-ref="eList" class="ag-autocomplete-list"></div>
        <div>`
    );
    this.params = params;
    this.eList = RefPlaceholder;
    this.searchString = "";
  }
  destroy() {
    super.destroy();
  }
  postConstruct() {
    this.autocompleteEntries = this.params.autocompleteEntries;
    this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: "autocomplete" }));
    this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
    this.eList.appendChild(this.virtualList.getGui());
    this.virtualList.setModel({
      getRowCount: () => this.autocompleteEntries.length,
      getRow: (index) => this.autocompleteEntries[index]
    });
    const virtualListGui = this.virtualList.getGui();
    this.addManagedListeners(virtualListGui, {
      click: () => this.params.onConfirmed(),
      mousemove: this.onMouseMove.bind(this),
      mousedown: (e) => e.preventDefault()
    });
    this.setSelectedValue(0);
  }
  onNavigationKeyDown(event, key) {
    event.preventDefault();
    const oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
    const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
    this.checkSetSelectedValue(newIndex);
  }
  setSearch(searchString) {
    this.searchString = searchString;
    if (_exists3(searchString)) {
      this.runSearch();
    } else {
      this.autocompleteEntries = this.params.autocompleteEntries;
      this.virtualList.refresh();
      this.checkSetSelectedValue(0);
    }
    this.updateSearchInList();
  }
  runContainsSearch(searchString, searchStrings) {
    let topMatch;
    let topMatchStartsWithSearchString = false;
    const lowerCaseSearchString = searchString.toLocaleLowerCase();
    const allMatches = searchStrings.filter((string) => {
      const lowerCaseString = string.toLocaleLowerCase();
      const index = lowerCaseString.indexOf(lowerCaseSearchString);
      const startsWithSearchString = index === 0;
      const isMatch = index >= 0;
      if (isMatch && (!topMatch || !topMatchStartsWithSearchString && startsWithSearchString || topMatchStartsWithSearchString === startsWithSearchString && string.length < topMatch.length)) {
        topMatch = string;
        topMatchStartsWithSearchString = startsWithSearchString;
      }
      return isMatch;
    });
    if (!topMatch && allMatches.length) {
      topMatch = allMatches[0];
    }
    return { topMatch, allMatches };
  }
  runSearch() {
    const { autocompleteEntries } = this.params;
    const searchStrings = autocompleteEntries.map((v) => v.displayValue ?? v.key);
    let matchingStrings;
    let topSuggestion;
    if (this.params.useFuzzySearch) {
      matchingStrings = _fuzzySuggestions(this.searchString, searchStrings, true).values;
      topSuggestion = matchingStrings.length ? matchingStrings[0] : void 0;
    } else {
      const containsMatches = this.runContainsSearch(this.searchString, searchStrings);
      matchingStrings = containsMatches.allMatches;
      topSuggestion = containsMatches.topMatch;
    }
    let filteredEntries = autocompleteEntries.filter(
      ({ key, displayValue }) => matchingStrings.includes(displayValue ?? key)
    );
    if (!filteredEntries.length && this.selectedValue && this.params?.forceLastSelection?.(this.selectedValue, this.searchString)) {
      filteredEntries = [this.selectedValue];
    }
    this.autocompleteEntries = filteredEntries;
    this.virtualList.refresh();
    if (!topSuggestion) {
      return;
    }
    const topSuggestionIndex = matchingStrings.indexOf(topSuggestion);
    this.checkSetSelectedValue(topSuggestionIndex);
  }
  updateSearchInList() {
    this.virtualList.forEachRenderedRow((row) => row.setSearchString(this.searchString));
  }
  checkSetSelectedValue(index) {
    if (index >= 0 && index < this.autocompleteEntries.length) {
      this.setSelectedValue(index);
    }
  }
  setSelectedValue(index) {
    const value = this.autocompleteEntries[index];
    if (this.selectedValue === value) {
      return;
    }
    this.selectedValue = value;
    this.virtualList.ensureIndexVisible(index);
    this.virtualList.forEachRenderedRow((cmp, idx) => {
      cmp.updateSelected(index === idx);
    });
  }
  createRowComponent(value) {
    const row = new AgAutocompleteRow();
    this.createBean(row);
    row.setState(value.displayValue ?? value.key, value === this.selectedValue);
    return row;
  }
  onMouseMove(mouseEvent) {
    const rect = this.virtualList.getGui().getBoundingClientRect();
    const scrollTop = this.virtualList.getScrollTop();
    const mouseY = mouseEvent.clientY - rect.top + scrollTop;
    const row = Math.floor(mouseY / this.virtualList.getRowHeight());
    this.checkSetSelectedValue(row);
  }
  afterGuiAttached() {
    this.virtualList.refresh();
  }
  getSelectedValue() {
    if (!this.autocompleteEntries.length) {
      return null;
    }
    return this.selectedValue ?? null;
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/autocomplete/agAutocomplete.ts
var AgAutocomplete = class extends Component2 {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-autocomplete" role="presentation">
                <ag-input-text-field data-ref="eAutocompleteInput"></ag-input-text-field>
            </div>`,
      [AgInputTextFieldSelector]
    );
    this.eAutocompleteInput = RefPlaceholder2;
    this.isListOpen = false;
    this.lastPosition = 0;
    this.valid = true;
  }
  wireBeans(beans) {
    this.popupService = beans.popupService;
  }
  postConstruct() {
    this.eAutocompleteInput.onValueChange((value) => this.onValueChanged(value));
    this.eAutocompleteInput.getInputElement().setAttribute("autocomplete", "off");
    this.addGuiEventListener("keydown", this.onKeyDown.bind(this));
    this.addGuiEventListener("click", this.updatePositionAndList.bind(this));
    this.addDestroyFunc(() => {
      this.destroyBean(this.autocompleteList);
    });
    this.addGuiEventListener("focusout", () => this.onFocusOut());
  }
  onValueChanged(value) {
    const parsedValue = _makeNull(value);
    this.updateValue(parsedValue);
    this.updateAutocompleteList(parsedValue);
  }
  updateValue(value) {
    this.updateLastPosition();
    this.dispatchLocalEvent({
      type: "eventValueChanged",
      value
    });
    this.validate(value);
  }
  updateAutocompleteList(value) {
    const autocompleteListParams = this.listGenerator?.(value, this.lastPosition) ?? { enabled: false };
    if (!autocompleteListParams.type || autocompleteListParams.type !== this.autocompleteListParams?.type) {
      if (this.isListOpen) {
        this.closeList();
      }
    }
    this.autocompleteListParams = autocompleteListParams;
    if (this.autocompleteListParams?.enabled) {
      if (!this.isListOpen) {
        this.openList();
      }
      const { searchString } = this.autocompleteListParams;
      this.autocompleteList.setSearch(searchString ?? "");
    } else {
      if (this.isListOpen) {
        this.closeList();
      }
    }
  }
  onKeyDown(event) {
    const key = event.key;
    this.updateLastPosition();
    switch (key) {
      case KeyCode2.ENTER:
        this.onEnterKeyDown(event);
        break;
      case KeyCode2.TAB:
        this.onTabKeyDown(event);
        break;
      case KeyCode2.DOWN:
      case KeyCode2.UP:
        this.onUpDownKeyDown(event, key);
        break;
      case KeyCode2.LEFT:
      case KeyCode2.RIGHT:
      case KeyCode2.PAGE_HOME:
      case KeyCode2.PAGE_END:
        setTimeout(() => {
          this.updatePositionAndList();
        });
        break;
      case KeyCode2.ESCAPE:
        this.onEscapeKeyDown(event);
        break;
      case KeyCode2.SPACE:
        if (event.ctrlKey && !this.isListOpen) {
          event.preventDefault();
          this.forceOpenList();
        }
        break;
    }
  }
  confirmSelection() {
    const selectedValue = this.autocompleteList?.getSelectedValue();
    if (selectedValue) {
      this.closeList();
      this.dispatchLocalEvent({
        type: "eventOptionSelected",
        value: this.getValue(),
        position: this.lastPosition,
        updateEntry: selectedValue,
        autocompleteType: this.autocompleteListParams.type
      });
    }
  }
  onTabKeyDown(event) {
    if (this.isListOpen) {
      event.preventDefault();
      event.stopPropagation();
      this.confirmSelection();
    }
  }
  onEnterKeyDown(event) {
    event.preventDefault();
    if (this.isListOpen) {
      this.confirmSelection();
    } else {
      this.onCompleted();
    }
  }
  onUpDownKeyDown(event, key) {
    event.preventDefault();
    if (!this.isListOpen) {
      this.forceOpenList();
    } else {
      this.autocompleteList?.onNavigationKeyDown(event, key);
    }
  }
  onEscapeKeyDown(event) {
    if (this.isListOpen) {
      event.preventDefault();
      event.stopPropagation();
      this.closeList();
      this.setCaret(this.lastPosition, true);
    }
  }
  onFocusOut() {
    if (this.isListOpen) {
      this.closeList();
    }
  }
  updatePositionAndList() {
    this.updateLastPosition();
    this.updateAutocompleteList(this.eAutocompleteInput.getValue() ?? null);
  }
  setCaret(position, setFocus) {
    const eDocument = this.gos.getDocument();
    const activeEl = this.gos.getActiveDomElement();
    if (setFocus && (!activeEl || activeEl === eDocument.body)) {
      this.eAutocompleteInput.getFocusableElement().focus();
    }
    const eInput = this.eAutocompleteInput.getInputElement();
    eInput.setSelectionRange(position, position);
    if (position === eInput.value.length) {
      eInput.scrollLeft = eInput.scrollWidth;
    }
  }
  forceOpenList() {
    this.onValueChanged(this.eAutocompleteInput.getValue());
  }
  updateLastPosition() {
    this.lastPosition = this.eAutocompleteInput.getInputElement().selectionStart ?? 0;
  }
  validate(value) {
    if (!this.validator) {
      return;
    }
    this.validationMessage = this.validator(value);
    this.eAutocompleteInput.getInputElement().setCustomValidity(this.validationMessage ?? "");
    this.valid = !this.validationMessage;
    this.dispatchLocalEvent({
      type: "eventValidChanged",
      isValid: this.valid,
      validationMessage: this.validationMessage
    });
  }
  openList() {
    this.isListOpen = true;
    this.autocompleteList = this.createBean(
      new AgAutocompleteList({
        autocompleteEntries: this.autocompleteListParams.entries,
        onConfirmed: () => this.confirmSelection(),
        forceLastSelection: this.forceLastSelection
      })
    );
    const ePopupGui = this.autocompleteList.getGui();
    const positionParams = {
      ePopup: ePopupGui,
      type: "autocomplete",
      eventSource: this.getGui(),
      position: "under",
      alignSide: this.gos.get("enableRtl") ? "right" : "left",
      keepWithinBounds: true
    };
    const addPopupRes = this.popupService.addPopup({
      eChild: ePopupGui,
      anchorToElement: this.getGui(),
      positionCallback: () => this.popupService.positionPopupByComponent(positionParams),
      ariaLabel: this.listAriaLabel
    });
    this.hidePopup = addPopupRes.hideFunc;
    this.autocompleteList.afterGuiAttached();
  }
  closeList() {
    this.isListOpen = false;
    this.hidePopup();
    this.destroyBean(this.autocompleteList);
    this.autocompleteList = null;
  }
  onCompleted() {
    if (this.isListOpen) {
      this.closeList();
    }
    this.dispatchLocalEvent({
      type: "eventValueConfirmed",
      value: this.getValue(),
      isValid: this.isValid()
    });
  }
  getValue() {
    return _makeNull(this.eAutocompleteInput.getValue());
  }
  setInputPlaceholder(placeholder) {
    this.eAutocompleteInput.setInputPlaceholder(placeholder);
    return this;
  }
  setInputAriaLabel(label) {
    this.eAutocompleteInput.setInputAriaLabel(label);
    return this;
  }
  setListAriaLabel(label) {
    this.listAriaLabel = label;
    return this;
  }
  setListGenerator(listGenerator) {
    this.listGenerator = listGenerator;
    return this;
  }
  setValidator(validator) {
    this.validator = validator;
    return this;
  }
  isValid() {
    return this.valid;
  }
  setValue(params) {
    const { value, position, silent, updateListOnlyIfOpen, restoreFocus } = params;
    this.eAutocompleteInput.setValue(value, true);
    this.setCaret(position ?? this.lastPosition, restoreFocus);
    if (!silent) {
      this.updateValue(value);
    }
    if (!updateListOnlyIfOpen || this.isListOpen) {
      this.updateAutocompleteList(value);
    }
  }
  setForceLastSelection(forceLastSelection) {
    this.forceLastSelection = forceLastSelection;
    return this;
  }
  setInputDisabled(disabled) {
    this.eAutocompleteInput.setDisabled(disabled);
    return this;
  }
};
var AgAutocompleteSelector = {
  selector: "AG-AUTOCOMPLETE",
  component: AgAutocomplete
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterComp.ts
var AdvancedFilterComp = class extends Component3 {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter" role="presentation" tabindex="-1">
                <ag-autocomplete data-ref="eAutocomplete"></ag-autocomplete>
                <button class="ag-button ag-standard-button ag-advanced-filter-apply-button" data-ref="eApplyFilterButton"></button>
                <button class="ag-advanced-filter-builder-button" data-ref="eBuilderFilterButton">
                    <span data-ref="eBuilderFilterButtonIcon" aria-hidden="true"></span>
                    <span class="ag-advanced-filter-builder-button-label" data-ref="eBuilderFilterButtonLabel"></span>
                </button>
            </div>`,
      [AgAutocompleteSelector]
    );
    this.eAutocomplete = RefPlaceholder3;
    this.eApplyFilterButton = RefPlaceholder3;
    this.eBuilderFilterButton = RefPlaceholder3;
    this.eBuilderFilterButtonIcon = RefPlaceholder3;
    this.eBuilderFilterButtonLabel = RefPlaceholder3;
    this.expressionParser = null;
    this.isApplyDisabled = true;
    this.builderOpen = false;
  }
  wireBeans(beans) {
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
    this.advancedFilterService = beans.advancedFilterService;
    this.filterManager = beans.filterManager;
  }
  postConstruct() {
    this.eAutocomplete.setListGenerator((_value, position) => this.generateAutocompleteListParams(position)).setValidator(() => this.validateValue()).setForceLastSelection(
      (lastSelection, searchString) => this.forceLastSelection(lastSelection, searchString)
    ).setInputAriaLabel(this.advancedFilterExpressionService.translate("ariaAdvancedFilterInput")).setListAriaLabel(this.advancedFilterExpressionService.translate("ariaLabelAdvancedFilterAutocomplete"));
    this.refresh();
    this.addManagedListeners(this.eAutocomplete, {
      eventValueChanged: ({ value }) => this.onValueChanged(value),
      eventValueConfirmed: ({ isValid }) => this.onValueConfirmed(isValid),
      eventOptionSelected: ({ position, updateEntry, autocompleteType }) => this.onOptionSelected(position, updateEntry, autocompleteType),
      eventValidChanged: ({ isValid, validationMessage }) => this.onValidChanged(isValid, validationMessage)
    });
    this.setupApplyButton();
    this.setupBuilderButton();
  }
  refresh() {
    const expression = this.advancedFilterService.getExpressionDisplayValue();
    this.eAutocomplete.setValue({
      value: expression ?? "",
      position: expression?.length,
      updateListOnlyIfOpen: true
    });
  }
  setInputDisabled(disabled) {
    this.eAutocomplete.setInputDisabled(disabled);
    _setDisabled(this.eApplyFilterButton, disabled || this.isApplyDisabled);
  }
  getTooltipParams() {
    const res = super.getTooltipParams();
    res.location = "advancedFilter";
    return res;
  }
  setupApplyButton() {
    this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterApply");
    this.activateTabIndex([this.eApplyFilterButton]);
    this.addManagedElementListeners(this.eApplyFilterButton, {
      click: () => this.onValueConfirmed(this.eAutocomplete.isValid())
    });
    _setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
  }
  setupBuilderButton() {
    this.eBuilderFilterButtonIcon.appendChild(_createIconNoSpan("advancedFilterBuilder", this.gos));
    this.eBuilderFilterButtonLabel.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilder");
    this.activateTabIndex([this.eBuilderFilterButton]);
    this.addManagedElementListeners(this.eBuilderFilterButton, { click: () => this.openBuilder() });
    this.addManagedListeners(this.advancedFilterService.getCtrl(), {
      advancedFilterBuilderClosed: () => this.closeBuilder()
    });
  }
  onValueChanged(value) {
    value = _makeNull2(value);
    this.advancedFilterService.setExpressionDisplayValue(value);
    this.expressionParser = this.advancedFilterService.createExpressionParser(value);
    const updatedExpression = this.expressionParser?.parseExpression();
    if (updatedExpression && updatedExpression !== value) {
      this.eAutocomplete.setValue({ value: updatedExpression, silent: true, restoreFocus: true });
    }
  }
  onValueConfirmed(isValid) {
    if (!isValid || this.isApplyDisabled) {
      return;
    }
    _setDisabled(this.eApplyFilterButton, true);
    this.advancedFilterService.applyExpression();
    this.filterManager?.onFilterChanged({ source: "advancedFilter" });
  }
  onOptionSelected(position, updateEntry, type) {
    const { updatedValue, updatedPosition, hideAutocomplete } = this.updateExpression(position, updateEntry, type);
    this.eAutocomplete.setValue({
      value: updatedValue,
      position: updatedPosition,
      updateListOnlyIfOpen: hideAutocomplete,
      restoreFocus: true
    });
  }
  validateValue() {
    return this.expressionParser?.isValid() ? null : this.expressionParser?.getValidationMessage() ?? null;
  }
  onValidChanged(isValid, validationMessage) {
    this.isApplyDisabled = !isValid || this.advancedFilterService.isCurrentExpressionApplied();
    _setDisabled(this.eApplyFilterButton, this.isApplyDisabled);
    this.setTooltip({
      newTooltipText: validationMessage,
      showDelayOverride: 1e3
    });
  }
  generateAutocompleteListParams(position) {
    return this.expressionParser ? this.expressionParser.getAutocompleteListParams(position) : this.advancedFilterExpressionService.getDefaultAutocompleteListParams("");
  }
  updateExpression(position, updateEntry, type) {
    this.advancedFilterExpressionService.updateAutocompleteCache(updateEntry, type);
    return this.expressionParser?.updateExpression(position, updateEntry, type) ?? this.advancedFilterService.getDefaultExpression(updateEntry);
  }
  forceLastSelection({ key, displayValue }, searchString) {
    return !!searchString.toLocaleLowerCase().match(`^${(displayValue ?? key).toLocaleLowerCase()}\\s*$`);
  }
  openBuilder() {
    if (this.builderOpen) {
      return;
    }
    this.builderOpen = true;
    _setDisabled(this.eBuilderFilterButton, true);
    this.advancedFilterService.getCtrl().toggleFilterBuilder("ui");
  }
  closeBuilder() {
    if (!this.builderOpen) {
      return;
    }
    this.builderOpen = false;
    _setDisabled(this.eBuilderFilterButton, false);
    this.eBuilderFilterButton.focus();
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterHeaderComp.ts
import {
  Component as Component4,
  KeyCode as KeyCode3,
  _clearElement,
  _setAriaColIndex,
  _setAriaColSpan,
  _setAriaRole,
  _setAriaRowIndex,
  _setDisplayed
} from "@ag-grid-community/core";
var AdvancedFilterHeaderComp = class extends Component4 {
  constructor(enabled) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-header" role="row">
            </div>`
    );
    this.enabled = enabled;
  }
  wireBeans(beans) {
    this.columnModel = beans.columnModel;
    this.focusService = beans.focusService;
    this.headerNavigationService = beans.headerNavigationService;
  }
  postConstruct() {
    this.setupAdvancedFilter(this.enabled);
    this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));
    const heightListener = () => {
      if (this.enabled) {
        this.setEnabledHeight();
      }
    };
    this.addManagedEventListeners({
      gridColumnsChanged: () => this.onGridColumnsChanged(),
      columnHeaderHeightChanged: heightListener,
      gridStylesChanged: heightListener
    });
    this.addManagedPropertyListener("headerHeight", heightListener);
    this.addManagedPropertyListener("floatingFiltersHeight", heightListener);
    this.addGuiEventListener("keydown", (event) => this.onKeyDown(event));
    this.addGuiEventListener("focusout", (event) => {
      if (!this.getFocusableElement().contains(event.relatedTarget)) {
        this.focusService.clearAdvancedFilterColumn();
      }
    });
  }
  getFocusableElement() {
    return this.eAdvancedFilter?.getGui() ?? this.getGui();
  }
  setEnabled(enabled) {
    if (enabled === this.enabled) {
      return;
    }
    this.setupAdvancedFilter(enabled);
  }
  refresh() {
    this.eAdvancedFilter?.refresh();
  }
  getHeight() {
    return this.height;
  }
  setInputDisabled(disabled) {
    this.eAdvancedFilter?.setInputDisabled(disabled);
  }
  setupAdvancedFilter(enabled) {
    const eGui = this.getGui();
    if (enabled) {
      this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
      const eAdvancedFilterGui = this.eAdvancedFilter.getGui();
      this.eAdvancedFilter.addCssClass("ag-advanced-filter-header-cell");
      this.setEnabledHeight();
      this.setAriaRowIndex();
      _setAriaRole(eAdvancedFilterGui, "gridcell");
      _setAriaColIndex(eAdvancedFilterGui, 1);
      this.setAriaColumnCount(eAdvancedFilterGui);
      eGui.appendChild(eAdvancedFilterGui);
    } else {
      _clearElement(eGui);
      this.destroyBean(this.eAdvancedFilter);
      this.height = 0;
    }
    _setDisplayed(eGui, enabled);
    this.enabled = enabled;
  }
  setEnabledHeight() {
    const eGui = this.getGui();
    this.height = this.columnModel.getFloatingFiltersHeight();
    const height = `${this.height}px`;
    eGui.style.height = height;
    eGui.style.minHeight = height;
  }
  setAriaColumnCount(eAdvancedFilterGui) {
    _setAriaColSpan(eAdvancedFilterGui, this.columnModel.getCols().length);
  }
  setAriaRowIndex() {
    _setAriaRowIndex(this.getGui(), this.headerNavigationService.getHeaderRowCount());
  }
  onGridColumnsChanged() {
    if (!this.eAdvancedFilter) {
      return;
    }
    this.setAriaColumnCount(this.eAdvancedFilter.getGui());
    this.setAriaRowIndex();
  }
  onKeyDown(event) {
    switch (event.key) {
      case KeyCode3.ENTER: {
        if (this.hasFocus()) {
          if (this.focusService.focusInto(this.getFocusableElement())) {
            event.preventDefault();
          }
        }
        break;
      }
      case KeyCode3.ESCAPE:
        if (!this.hasFocus()) {
          this.getFocusableElement().focus();
        }
        break;
      case KeyCode3.UP:
        this.navigateUpDown(true, event);
        break;
      case KeyCode3.DOWN:
        this.navigateUpDown(false, event);
        break;
      case KeyCode3.TAB:
        if (this.hasFocus()) {
          this.navigateLeftRight(event);
        } else {
          const nextFocusableEl = this.focusService.findNextFocusableElement(
            this.getFocusableElement(),
            null,
            event.shiftKey
          );
          if (nextFocusableEl) {
            event.preventDefault();
            nextFocusableEl.focus();
          } else {
            this.navigateLeftRight(event);
          }
        }
        break;
    }
  }
  navigateUpDown(backwards, event) {
    if (this.hasFocus()) {
      if (this.focusService.focusNextFromAdvancedFilter(backwards)) {
        event.preventDefault();
      }
    }
  }
  navigateLeftRight(event) {
    if (event.shiftKey ? this.focusService.focusLastHeader() : this.focusService.focusNextFromAdvancedFilter(false, true)) {
      event.preventDefault();
    }
  }
  hasFocus() {
    return this.gos.getActiveDomElement() === this.getFocusableElement();
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderComp.ts
import { Component as Component9, RefPlaceholder as RefPlaceholder7, TooltipFeature as TooltipFeature3, _exists as _exists6, _setDisabled as _setDisabled2 } from "@ag-grid-community/core";
import { VirtualList as VirtualList2 } from "@ag-grid-enterprise/core";

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderDragFeature.ts
import { BeanStub as BeanStub2, DragSourceType } from "@ag-grid-community/core";
import { VirtualListDragFeature } from "@ag-grid-enterprise/core";
var AdvancedFilterBuilderDragFeature = class extends BeanStub2 {
  constructor(comp, virtualList) {
    super();
    this.comp = comp;
    this.virtualList = virtualList;
  }
  postConstruct() {
    this.createManagedBean(
      new VirtualListDragFeature(this.comp, this.virtualList, {
        dragSourceType: DragSourceType.AdvancedFilterBuilder,
        listItemDragStartEvent: "advancedFilterBuilderDragStarted",
        listItemDragEndEvent: "advancedFilterBuilderDragEnded",
        eventSource: this,
        getCurrentDragValue: (listItemDragStartEvent) => this.getCurrentDragValue(listItemDragStartEvent),
        isMoveBlocked: () => false,
        getNumRows: (comp) => comp.getNumItems(),
        moveItem: (currentDragValue, lastHoveredListItem) => this.moveItem(currentDragValue, lastHoveredListItem)
      })
    );
  }
  getCurrentDragValue(listItemDragStartEvent) {
    return listItemDragStartEvent.item;
  }
  moveItem(currentDragValue, lastHoveredListItem) {
    this.comp.moveItem(currentDragValue, lastHoveredListItem);
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemAddComp.ts
import { Component as Component5, RefPlaceholder as RefPlaceholder4, TooltipFeature, _setAriaLabel as _setAriaLabel2, _setAriaLevel } from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/builder/addDropdownComp.ts
import {
  AgInputTextFieldSelector as AgInputTextFieldSelector2,
  _setAriaLabel,
  _setAriaLabelledBy,
  _setDisplayed as _setDisplayed2,
  _stopPropagationForAgGrid
} from "@ag-grid-community/core";
import { AgRichSelect } from "@ag-grid-enterprise/core";
var AddDropdownComp = class extends AgRichSelect {
  constructor(params) {
    super({
      ...params,
      template: (
        /* html */
        `
                <div class="ag-picker-field" role="presentation">
                    <div data-ref="eLabel"></div>
                    <div data-ref="eWrapper" class="ag-wrapper ag-picker-collapsed">
                        <div data-ref="eDisplayField" class="ag-picker-field-display"></div>
                        <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <span data-ref="eDeselect" class="ag-rich-select-deselect-button ag-picker-field-icon" role="presentation"></span>
                        <div data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`
      ),
      agComponents: [AgInputTextFieldSelector2]
    });
    this.params = params;
  }
  showPicker() {
    setTimeout(() => super.showPicker());
  }
  hidePicker() {
    setTimeout(() => super.hidePicker());
  }
  postConstruct() {
    super.postConstruct();
    const { wrapperClassName, ariaLabel } = this.params;
    _setDisplayed2(this.eDisplayField, false);
    if (wrapperClassName) {
      this.eWrapper.classList.add(wrapperClassName);
    }
    _setAriaLabelledBy(this.eWrapper, "");
    _setAriaLabel(this.eWrapper, ariaLabel);
  }
  onEnterKeyDown(event) {
    _stopPropagationForAgGrid(event);
    if (this.isPickerDisplayed) {
      super.onEnterKeyDown(event);
    } else {
      event.preventDefault();
      this.showPicker();
    }
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemNavigationFeature.ts
import { BeanStub as BeanStub3, KeyCode as KeyCode4, _isStopPropagationForAgGrid, _stopPropagationForAgGrid as _stopPropagationForAgGrid2 } from "@ag-grid-community/core";
var AdvancedFilterBuilderItemNavigationFeature = class extends BeanStub3 {
  constructor(eGui, focusWrapper, eFocusableComp) {
    super();
    this.eGui = eGui;
    this.focusWrapper = focusWrapper;
    this.eFocusableComp = eFocusableComp;
  }
  postConstruct() {
    this.addManagedElementListeners(this.eGui, {
      keydown: (event) => {
        switch (event.key) {
          case KeyCode4.TAB:
            if (!event.defaultPrevented) {
              _stopPropagationForAgGrid2(event);
            }
            break;
          case KeyCode4.UP:
          case KeyCode4.DOWN:
            _stopPropagationForAgGrid2(event);
            break;
          case KeyCode4.ESCAPE:
            if (_isStopPropagationForAgGrid(event)) {
              return;
            }
            if (this.eGui.contains(this.gos.getActiveDomElement())) {
              event.preventDefault();
              _stopPropagationForAgGrid2(event);
              this.focusWrapper.focus();
            }
            break;
        }
      }
    });
    const highlightClass = "ag-advanced-filter-builder-virtual-list-item-highlight";
    this.addManagedListeners(this.focusWrapper, {
      keydown: (event) => {
        switch (event.key) {
          case KeyCode4.ENTER:
            if (_isStopPropagationForAgGrid(event)) {
              return;
            }
            if (this.gos.getActiveDomElement() === this.focusWrapper) {
              event.preventDefault();
              _stopPropagationForAgGrid2(event);
              this.eFocusableComp.getFocusableElement().focus();
            }
            break;
        }
      },
      focusin: () => {
        this.focusWrapper.classList.add(highlightClass);
      },
      focusout: (event) => {
        if (!this.focusWrapper.contains(event.relatedTarget)) {
          this.focusWrapper.classList.remove(highlightClass);
        }
      }
    });
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderUtils.ts
function getAdvancedFilterBuilderAddButtonParams(translate, maxPickerWidth) {
  return {
    pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderAddField",
    pickerAriaLabelValue: "Advanced Filter Builder Add Field",
    pickerType: "ag-list",
    valueList: [
      {
        key: "condition",
        displayValue: translate("advancedFilterBuilderAddCondition")
      },
      {
        key: "join",
        displayValue: translate("advancedFilterBuilderAddJoin")
      }
    ],
    valueFormatter: (value) => value == null ? null : value.displayValue ?? value.key,
    pickerIcon: "advancedFilterBuilderAdd",
    maxPickerWidth: `${maxPickerWidth ?? 120}px`,
    wrapperClassName: "ag-advanced-filter-builder-item-button",
    ariaLabel: translate("advancedFilterBuilderAddButtonTooltip")
  };
}

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemAddComp.ts
var AdvancedFilterBuilderItemAddComp = class extends Component5 {
  constructor(item, focusWrapper) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-wrapper" role="presentation">
                <div data-ref="eItem" class="ag-advanced-filter-builder-item" role="presentation">
                    <div class="ag-advanced-filter-builder-item-tree-lines" aria-hidden="true">
                        <div class="ag-advanced-filter-builder-item-tree-line-vertical-top ag-advanced-filter-builder-item-tree-line-horizontal"></div>
                    </div>
                </div>
            </div>
        `
    );
    this.item = item;
    this.focusWrapper = focusWrapper;
    this.eItem = RefPlaceholder4;
  }
  wireBeans(beans) {
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  postConstruct() {
    _setAriaLevel(this.focusWrapper, 2);
    const addButtonParams = getAdvancedFilterBuilderAddButtonParams(
      (key) => this.advancedFilterExpressionService.translate(key),
      this.gos.get("advancedFilterBuilderParams")?.addSelectWidth
    );
    const eAddButton = this.createManagedBean(new AddDropdownComp(addButtonParams));
    this.addManagedListeners(eAddButton, {
      fieldPickerValueSelected: ({ value }) => {
        this.dispatchLocalEvent({
          type: "advancedFilterBuilderAdded",
          item: this.item,
          isJoin: value.key === "join"
        });
      }
    });
    this.eItem.appendChild(eAddButton.getGui());
    this.createManagedBean(
      new TooltipFeature({
        getGui: () => eAddButton.getGui(),
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip")
      })
    );
    this.createManagedBean(
      new AdvancedFilterBuilderItemNavigationFeature(this.getGui(), this.focusWrapper, eAddButton)
    );
    _setAriaLabel2(
      this.focusWrapper,
      this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderItem", [
        this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip"),
        `${this.item.level + 1}`
      ])
    );
  }
  afterAdd() {
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemComp.ts
import {
  DragSourceType as DragSourceType2,
  KeyCode as KeyCode6,
  RefPlaceholder as RefPlaceholder6,
  TabGuardComp,
  TooltipFeature as TooltipFeature2,
  _createIconNoSpan as _createIconNoSpan2,
  _removeAriaExpanded,
  _setAriaDisabled,
  _setAriaExpanded,
  _setAriaLabel as _setAriaLabel5,
  _setAriaLevel as _setAriaLevel2,
  _setDisplayed as _setDisplayed4,
  _setVisible,
  _stopPropagationForAgGrid as _stopPropagationForAgGrid5
} from "@ag-grid-community/core";

// enterprise-modules/advanced-filter/src/advancedFilter/builder/conditionPillWrapperComp.ts
import { Component as Component6, _exists as _exists4, _removeFromParent } from "@ag-grid-community/core";
var ConditionPillWrapperComp = class extends Component6 {
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-condition" role="presentation"></div>
        `
    );
    this.validationMessage = null;
  }
  wireBeans(beans) {
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  init(params) {
    const { item, createPill } = params;
    this.item = item;
    this.createPill = createPill;
    this.filterModel = item.filterModel;
    this.setupColumnCondition(this.filterModel);
    this.validate();
    this.addDestroyFunc(() => this.destroyBeans([this.eColumnPill, this.eOperatorPill, this.eOperandPill]));
  }
  getDragName() {
    return this.filterModel.colId ? this.advancedFilterExpressionService.parseColumnFilterModel(this.filterModel) : this.getDefaultColumnDisplayValue();
  }
  getAriaLabel() {
    return `${this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderFilterItem")} ${this.getDragName()}`;
  }
  getValidationMessage() {
    return this.validationMessage;
  }
  getFocusableElement() {
    return this.eColumnPill.getFocusableElement();
  }
  setupColumnCondition(filterModel) {
    const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
    this.baseCellDataType = columnDetails.baseCellDataType;
    this.column = columnDetails.column;
    this.numOperands = this.getNumOperands(this.getOperatorKey());
    this.eColumnPill = this.createPill({
      key: this.getColumnKey(),
      displayValue: this.getColumnDisplayValue() ?? this.getDefaultColumnDisplayValue(),
      cssClass: "ag-advanced-filter-builder-column-pill",
      isSelect: true,
      getEditorParams: () => ({ values: this.advancedFilterExpressionService.getColumnAutocompleteEntries() }),
      update: (key) => this.setColumnKey(key),
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderColumnSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Column Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderColumn")
    });
    this.getGui().appendChild(this.eColumnPill.getGui());
    if (_exists4(this.getColumnKey())) {
      this.createOperatorPill();
      if (this.hasOperand()) {
        this.createOperandPill();
      }
    }
  }
  createOperatorPill() {
    this.eOperatorPill = this.createPill({
      key: this.getOperatorKey(),
      displayValue: this.getOperatorDisplayValue() ?? this.getDefaultOptionSelectValue(),
      cssClass: "ag-advanced-filter-builder-option-pill",
      isSelect: true,
      getEditorParams: () => ({ values: this.getOperatorAutocompleteEntries() }),
      update: (key) => this.setOperatorKey(key),
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderOptionSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Option Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderOption")
    });
    this.eColumnPill.getGui().insertAdjacentElement("afterend", this.eOperatorPill.getGui());
  }
  createOperandPill() {
    const key = this.getOperandDisplayValue() ?? "";
    this.eOperandPill = this.createPill({
      key,
      displayValue: key,
      baseCellDataType: this.baseCellDataType,
      cssClass: "ag-advanced-filter-builder-value-pill",
      isSelect: false,
      update: (key2) => this.setOperand(key2),
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderValue")
    });
    this.getGui().appendChild(this.eOperandPill.getGui());
  }
  getColumnKey() {
    return this.filterModel.colId;
  }
  getColumnDisplayValue() {
    return this.advancedFilterExpressionService.getColumnDisplayValue(this.filterModel);
  }
  getOperatorKey() {
    return this.filterModel.type;
  }
  getOperatorDisplayValue() {
    return this.advancedFilterExpressionService.getOperatorDisplayValue(this.filterModel);
  }
  getOperandDisplayValue() {
    return this.advancedFilterExpressionService.getOperandDisplayValue(this.filterModel, true);
  }
  hasOperand() {
    return this.numOperands > 0;
  }
  getOperatorAutocompleteEntries() {
    return this.column ? this.advancedFilterExpressionService.getOperatorAutocompleteEntries(this.column, this.baseCellDataType) : [];
  }
  setColumnKey(colId) {
    if (!this.eOperatorPill) {
      this.createOperatorPill();
    }
    const newColumnDetails = this.advancedFilterExpressionService.getColumnDetails(colId);
    this.column = newColumnDetails.column;
    const newBaseCellDataType = newColumnDetails.baseCellDataType;
    if (this.baseCellDataType !== newBaseCellDataType) {
      this.baseCellDataType = newBaseCellDataType;
      this.setOperatorKey(void 0);
      if (this.eOperatorPill) {
        _removeFromParent(this.eOperatorPill.getGui());
        this.destroyBean(this.eOperatorPill);
        this.createOperatorPill();
      }
      this.validate();
    }
    this.filterModel.colId = colId;
    this.filterModel.filterType = this.baseCellDataType;
  }
  setOperatorKey(operator) {
    const newNumOperands = this.getNumOperands(operator);
    if (newNumOperands !== this.numOperands) {
      this.numOperands = newNumOperands;
      if (newNumOperands === 0) {
        this.destroyOperandPill();
      } else {
        this.createOperandPill();
        if (this.baseCellDataType !== "number") {
          this.setOperand("");
        }
      }
    }
    this.filterModel.type = operator;
    this.validate();
  }
  setOperand(operand) {
    let parsedOperand = operand;
    if (this.column) {
      parsedOperand = this.advancedFilterExpressionService.getOperandModelValue(
        operand,
        this.baseCellDataType,
        this.column
      ) ?? "";
    }
    this.filterModel.filter = parsedOperand;
    this.validate();
  }
  getNumOperands(operator) {
    return this.advancedFilterExpressionService.getExpressionOperator(this.baseCellDataType, operator)?.numOperands ?? 0;
  }
  destroyOperandPill() {
    delete this.filterModel.filter;
    this.getGui().removeChild(this.eOperandPill.getGui());
    this.destroyBean(this.eOperandPill);
    this.eOperandPill = void 0;
  }
  validate() {
    let validationMessage = null;
    if (!_exists4(this.getColumnKey())) {
      validationMessage = this.advancedFilterExpressionService.translate(
        "advancedFilterBuilderValidationSelectColumn"
      );
    } else if (!_exists4(this.getOperatorKey())) {
      validationMessage = this.advancedFilterExpressionService.translate(
        "advancedFilterBuilderValidationSelectOption"
      );
    } else if (this.numOperands > 0 && !_exists4(this.getOperandDisplayValue())) {
      validationMessage = this.advancedFilterExpressionService.translate(
        "advancedFilterBuilderValidationEnterValue"
      );
    }
    this.item.valid = !validationMessage;
    if (validationMessage !== this.validationMessage) {
      this.validationMessage = validationMessage;
      this.dispatchLocalEvent({
        type: "advancedFilterBuilderValidChanged"
      });
    }
  }
  getDefaultColumnDisplayValue() {
    return this.advancedFilterExpressionService.translate("advancedFilterBuilderSelectColumn");
  }
  getDefaultOptionSelectValue() {
    return this.advancedFilterExpressionService.translate("advancedFilterBuilderSelectOption");
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/inputPillComp.ts
import {
  AgInputDateField,
  AgInputNumberField,
  AgInputTextField,
  Component as Component7,
  KeyCode as KeyCode5,
  RefPlaceholder as RefPlaceholder5,
  _exists as _exists5,
  _setAriaDescribedBy,
  _setAriaLabel as _setAriaLabel3,
  _setDisplayed as _setDisplayed3,
  _stopPropagationForAgGrid as _stopPropagationForAgGrid3
} from "@ag-grid-community/core";
var InputPillComp = class extends Component7 {
  constructor(params) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-pill-wrapper" role="presentation">
                <div data-ref="ePill" class="ag-advanced-filter-builder-pill" role="button">
                    <span data-ref="eLabel" class="ag-advanced-filter-builder-pill-display"></span>
                </div>
            </div>
        `
    );
    this.params = params;
    this.ePill = RefPlaceholder5;
    this.eLabel = RefPlaceholder5;
    this.value = params.value;
  }
  wireBeans(beans) {
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  postConstruct() {
    const { cssClass, ariaLabel } = this.params;
    this.ePill.classList.add(cssClass);
    this.activateTabIndex([this.ePill]);
    this.eLabel.id = `${this.getCompId()}`;
    _setAriaDescribedBy(this.ePill, this.eLabel.id);
    _setAriaLabel3(this.ePill, ariaLabel);
    this.renderValue();
    this.addManagedListeners(this.ePill, {
      click: (event) => {
        event.preventDefault();
        this.showEditor();
      },
      keydown: (event) => {
        switch (event.key) {
          case KeyCode5.ENTER:
            event.preventDefault();
            _stopPropagationForAgGrid3(event);
            this.showEditor();
            break;
        }
      }
    });
    this.addDestroyFunc(() => this.destroyBean(this.eEditor));
  }
  getFocusableElement() {
    return this.ePill;
  }
  showEditor() {
    if (this.eEditor) {
      return;
    }
    _setDisplayed3(this.ePill, false);
    this.eEditor = this.createEditorComp(this.params.type);
    this.eEditor.setValue(this.value);
    const eEditorGui = this.eEditor.getGui();
    this.eEditor.addManagedElementListeners(eEditorGui, {
      keydown: (event) => {
        switch (event.key) {
          case KeyCode5.ENTER:
            event.preventDefault();
            _stopPropagationForAgGrid3(event);
            this.updateValue(true);
            break;
          case KeyCode5.ESCAPE:
            event.preventDefault();
            _stopPropagationForAgGrid3(event);
            this.hideEditor(true);
            break;
        }
      },
      focusout: () => this.updateValue(false)
    });
    this.getGui().appendChild(eEditorGui);
    this.eEditor.getFocusableElement().focus();
  }
  createEditorComp(type) {
    let comp;
    switch (type) {
      case "text":
        comp = new AgInputTextField();
        break;
      case "number":
        comp = new AgInputNumberField();
        break;
      case "date":
        comp = new AgInputDateField();
        break;
    }
    return this.createBean(comp);
  }
  hideEditor(keepFocus) {
    const { eEditor } = this;
    if (!eEditor) {
      return;
    }
    this.eEditor = void 0;
    this.getGui().removeChild(eEditor.getGui());
    this.destroyBean(eEditor);
    _setDisplayed3(this.ePill, true);
    if (keepFocus) {
      this.ePill.focus();
    }
  }
  renderValue() {
    let value;
    this.eLabel.classList.remove(
      "ag-advanced-filter-builder-value-empty",
      "ag-advanced-filter-builder-value-number",
      "ag-advanced-filter-builder-value-text"
    );
    if (!_exists5(this.value)) {
      value = this.advancedFilterExpressionService.translate("advancedFilterBuilderEnterValue");
      this.eLabel.classList.add("ag-advanced-filter-builder-value-empty");
    } else if (this.params.type === "number") {
      value = this.value;
      this.eLabel.classList.add("ag-advanced-filter-builder-value-number");
    } else {
      value = `"${this.value}"`;
      this.eLabel.classList.add("ag-advanced-filter-builder-value-text");
    }
    this.eLabel.innerText = value;
  }
  updateValue(keepFocus) {
    if (!this.eEditor) {
      return;
    }
    const value = this.eEditor.getValue() ?? "";
    this.dispatchLocalEvent({
      type: "fieldValueChanged",
      value
    });
    this.value = value;
    this.renderValue();
    this.hideEditor(keepFocus);
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/joinPillWrapperComp.ts
import { Component as Component8 } from "@ag-grid-community/core";
var JoinPillWrapperComp = class extends Component8 {
  wireBeans(beans) {
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  constructor() {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-condition" role="presentation"></div>
        `
    );
  }
  init(params) {
    const { item, createPill } = params;
    const filterModel = item.filterModel;
    this.filterModel = filterModel;
    this.ePill = createPill({
      key: filterModel.type,
      displayValue: this.advancedFilterExpressionService.parseJoinOperator(filterModel),
      cssClass: "ag-advanced-filter-builder-join-pill",
      isSelect: true,
      getEditorParams: () => ({
        values: this.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries()
      }),
      update: (key) => filterModel.type = key,
      pickerAriaLabelKey: "ariaLabelAdvancedFilterBuilderJoinSelectField",
      pickerAriaLabelValue: "Advanced Filter Builder Join Operator Select Field",
      ariaLabel: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderJoinOperator")
    });
    this.getGui().appendChild(this.ePill.getGui());
    this.addDestroyFunc(() => this.destroyBean(this.ePill));
  }
  getDragName() {
    return this.advancedFilterExpressionService.parseJoinOperator(this.filterModel);
  }
  getAriaLabel() {
    return `${this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderGroupItem")} ${this.getDragName()}`;
  }
  getValidationMessage() {
    return null;
  }
  getFocusableElement() {
    return this.ePill.getFocusableElement();
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/selectPillComp.ts
import {
  AgInputTextFieldSelector as AgInputTextFieldSelector3,
  _setAriaLabel as _setAriaLabel4,
  _setAriaLabelledBy as _setAriaLabelledBy2,
  _stopPropagationForAgGrid as _stopPropagationForAgGrid4
} from "@ag-grid-community/core";
import { AgRichSelect as AgRichSelect2 } from "@ag-grid-enterprise/core";
var SelectPillComp = class extends AgRichSelect2 {
  constructor(params) {
    super({
      ...params,
      template: (
        /* html */
        `
                <div class="ag-picker-field ag-advanced-filter-builder-pill-wrapper" role="presentation">
                    <div data-ref="eLabel"></div>
                    <div data-ref="eWrapper" class="ag-wrapper ag-advanced-filter-builder-pill ag-picker-collapsed">
                        <div data-ref="eDisplayField" class="ag-picker-field-display ag-advanced-filter-builder-pill-display"></div>
                        <ag-input-text-field data-ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
                        <span data-ref="eDeselect" class="ag-rich-select-deselect-button ag-picker-field-icon" role="presentation"></span>
                        <div data-ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                    </div>
                </div>`
      ),
      agComponents: [AgInputTextFieldSelector3]
    });
    this.params = params;
  }
  getFocusableElement() {
    return this.eWrapper;
  }
  showPicker() {
    setTimeout(() => super.showPicker());
  }
  hidePicker() {
    setTimeout(() => super.hidePicker());
  }
  postConstruct() {
    super.postConstruct();
    const { wrapperClassName, ariaLabel } = this.params;
    this.eWrapper.classList.add(wrapperClassName);
    _setAriaLabelledBy2(this.eWrapper, "");
    _setAriaLabel4(this.eWrapper, ariaLabel);
  }
  createPickerComponent() {
    if (!this.values) {
      const { values } = this.params.getEditorParams();
      this.values = values;
      const key = this.value.key;
      const value = values.find((value2) => value2.key === key) ?? {
        key,
        displayValue: this.value.displayValue
      };
      this.value = value;
    }
    return super.createPickerComponent();
  }
  onEnterKeyDown(event) {
    _stopPropagationForAgGrid4(event);
    if (this.isPickerDisplayed) {
      super.onEnterKeyDown(event);
    } else {
      event.preventDefault();
      this.showPicker();
    }
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderItemComp.ts
var AdvancedFilterBuilderItemComp = class extends TabGuardComp {
  constructor(item, dragFeature, focusWrapper) {
    super(
      /* html */
      `
            <div class="ag-advanced-filter-builder-item-wrapper" role="presentation">
                <div class="ag-advanced-filter-builder-item" role="presentation">
                    <div data-ref="eTreeLines" class="ag-advanced-filter-builder-item-tree-lines" aria-hidden="true"></div>
                    <span data-ref="eDragHandle" class="ag-drag-handle" aria-hidden="true"></span>
                    <span data-ref="eValidation" class="ag-advanced-filter-builder-item-button ag-advanced-filter-builder-invalid" aria-hidden="true"></span>
                </div>
                <div data-ref="eButtons" class="ag-advanced-filter-builder-item-buttons">
                    <span data-ref="eMoveUpButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                    <span data-ref="eMoveDownButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                    <div data-ref="eAddButton" role="presentation"></div>
                    <span data-ref="eRemoveButton" class="ag-advanced-filter-builder-item-button" role="button"></span>
                </div>
            </div>
        `
    );
    this.item = item;
    this.dragFeature = dragFeature;
    this.focusWrapper = focusWrapper;
    this.eTreeLines = RefPlaceholder6;
    this.eDragHandle = RefPlaceholder6;
    this.eButtons = RefPlaceholder6;
    this.eValidation = RefPlaceholder6;
    this.eMoveUpButton = RefPlaceholder6;
    this.eMoveDownButton = RefPlaceholder6;
    this.eAddButton = RefPlaceholder6;
    this.eRemoveButton = RefPlaceholder6;
    this.moveUpDisabled = false;
    this.moveDownDisabled = false;
  }
  wireBeans(beans) {
    this.dragAndDropService = beans.dragAndDropService;
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  postConstruct() {
    const { filterModel, level, showMove } = this.item;
    const isJoin = filterModel.filterType === "join";
    this.ePillWrapper = this.createManagedBean(isJoin ? new JoinPillWrapperComp() : new ConditionPillWrapperComp());
    this.ePillWrapper.init({ item: this.item, createPill: (params) => this.createPill(params) });
    this.eDragHandle.insertAdjacentElement("afterend", this.ePillWrapper.getGui());
    if (level === 0) {
      const eTreeLine = document.createElement("div");
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-vertical-bottom");
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-root");
      this.eTreeLines.appendChild(eTreeLine);
      _setDisplayed4(this.eDragHandle, false);
      _setDisplayed4(this.eButtons, false);
      _setAriaExpanded(this.focusWrapper, true);
    } else {
      this.setupTreeLines(level);
      this.eDragHandle.appendChild(_createIconNoSpan2("advancedFilterBuilderDrag", this.gos));
      this.setupValidation();
      this.setupMoveButtons(showMove);
      this.setupAddButton();
      this.setupRemoveButton();
      this.setupDragging();
      this.updateAriaExpanded();
    }
    _setAriaLevel2(this.focusWrapper, level + 1);
    this.initialiseTabGuard({});
    this.createManagedBean(
      new AdvancedFilterBuilderItemNavigationFeature(this.getGui(), this.focusWrapper, this.ePillWrapper)
    );
    this.updateAriaLabel();
    this.addManagedListeners(this.ePillWrapper, {
      advancedFilterBuilderValueChanged: () => this.dispatchLocalEvent({
        type: "advancedFilterBuilderValueChanged"
      }),
      advancedFilterBuilderValidChanged: () => this.updateValidity()
    });
  }
  setState(params) {
    const { level } = this.item;
    if (level === 0) {
      return;
    }
    const { showMove } = this.item;
    const { disableMoveUp, disableMoveDown, treeLines, showStartTreeLine } = params;
    this.updateTreeLines(treeLines, showStartTreeLine);
    this.updateAriaExpanded();
    if (showMove) {
      this.moveUpDisabled = !!disableMoveUp;
      this.moveDownDisabled = !!disableMoveDown;
      this.eMoveUpButton.classList.toggle("ag-advanced-filter-builder-item-button-disabled", disableMoveUp);
      this.eMoveDownButton.classList.toggle("ag-advanced-filter-builder-item-button-disabled", disableMoveDown);
      _setAriaDisabled(this.eMoveUpButton, !!disableMoveUp);
      _setAriaDisabled(this.eMoveDownButton, !!disableMoveDown);
      this.moveUpTooltipFeature.refreshToolTip();
      this.moveDownTooltipFeature.refreshToolTip();
    }
  }
  focusMoveButton(backwards) {
    (backwards ? this.eMoveUpButton : this.eMoveDownButton).focus();
  }
  afterAdd() {
    this.ePillWrapper.getFocusableElement().focus();
  }
  setupTreeLines(level) {
    for (let i = 0; i < level; i++) {
      const eTreeLine = document.createElement("div");
      this.eTreeLines.appendChild(eTreeLine);
    }
  }
  updateTreeLines(treeLines, showStartTreeLine) {
    const lastTreeLineIndex = treeLines.length - 1;
    const { children } = this.eTreeLines;
    for (let i = 0; i < lastTreeLineIndex; i++) {
      const eTreeLine2 = children.item(i);
      if (eTreeLine2) {
        eTreeLine2.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical", !treeLines[i]);
      }
    }
    const eTreeLine = children.item(lastTreeLineIndex);
    if (eTreeLine) {
      eTreeLine.classList.add("ag-advanced-filter-builder-item-tree-line-horizontal");
      const isLastChild = treeLines[lastTreeLineIndex];
      eTreeLine.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical-top", isLastChild);
      eTreeLine.classList.toggle("ag-advanced-filter-builder-item-tree-line-vertical", !isLastChild);
    }
    this.eDragHandle.classList.toggle(
      "ag-advanced-filter-builder-item-tree-line-vertical-bottom",
      showStartTreeLine
    );
  }
  setupValidation() {
    this.eValidation.appendChild(_createIconNoSpan2("advancedFilterBuilderInvalid", this.gos));
    this.validationTooltipFeature = this.createManagedBean(
      new TooltipFeature2({
        getGui: () => this.eValidation,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.ePillWrapper.getValidationMessage(),
        getTooltipShowDelayOverride: () => 1e3
      })
    );
    this.updateValidity();
  }
  setupAddButton() {
    const addButtonParams = getAdvancedFilterBuilderAddButtonParams(
      (key) => this.advancedFilterExpressionService.translate(key),
      this.gos.get("advancedFilterBuilderParams")?.addSelectWidth
    );
    const eAddButton = this.createManagedBean(new AddDropdownComp(addButtonParams));
    this.addManagedListeners(eAddButton, {
      fieldPickerValueSelected: ({ value }) => this.dispatchLocalEvent({
        type: "advancedFilterBuilderAdded",
        item: this.item,
        isJoin: value.key === "join"
      })
    });
    this.eAddButton.appendChild(eAddButton.getGui());
    this.createManagedBean(
      new TooltipFeature2({
        getGui: () => this.eAddButton,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderAddButtonTooltip")
      })
    );
  }
  setupRemoveButton() {
    this.eRemoveButton.appendChild(_createIconNoSpan2("advancedFilterBuilderRemove", this.gos));
    this.addManagedListeners(this.eRemoveButton, {
      click: () => this.removeItem(),
      keydown: (event) => {
        switch (event.key) {
          case KeyCode6.ENTER:
            event.preventDefault();
            _stopPropagationForAgGrid5(event);
            this.removeItem();
            break;
        }
      }
    });
    this.createManagedBean(
      new TooltipFeature2({
        getGui: () => this.eRemoveButton,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.advancedFilterExpressionService.translate("advancedFilterBuilderRemoveButtonTooltip")
      })
    );
    _setAriaLabel5(
      this.eRemoveButton,
      this.advancedFilterExpressionService.translate("advancedFilterBuilderRemoveButtonTooltip")
    );
    this.activateTabIndex([this.eRemoveButton]);
  }
  setupMoveButtons(showMove) {
    if (showMove) {
      this.eMoveUpButton.appendChild(_createIconNoSpan2("advancedFilterBuilderMoveUp", this.gos));
      this.addManagedListeners(this.eMoveUpButton, {
        click: () => this.moveItem(true),
        keydown: (event) => {
          switch (event.key) {
            case KeyCode6.ENTER:
              event.preventDefault();
              _stopPropagationForAgGrid5(event);
              this.moveItem(true);
              break;
          }
        }
      });
      this.moveUpTooltipFeature = this.createManagedBean(
        new TooltipFeature2({
          getGui: () => this.eMoveUpButton,
          getLocation: () => "advancedFilter",
          getTooltipValue: () => this.moveUpDisabled ? null : this.advancedFilterExpressionService.translate(
            "advancedFilterBuilderMoveUpButtonTooltip"
          )
        })
      );
      _setAriaLabel5(
        this.eMoveUpButton,
        this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveUpButtonTooltip")
      );
      this.eMoveDownButton.appendChild(_createIconNoSpan2("advancedFilterBuilderMoveDown", this.gos));
      this.addManagedListeners(this.eMoveDownButton, {
        click: () => this.moveItem(false),
        keydown: (event) => {
          switch (event.key) {
            case KeyCode6.ENTER:
              event.preventDefault();
              _stopPropagationForAgGrid5(event);
              this.moveItem(false);
              break;
          }
        }
      });
      this.moveDownTooltipFeature = this.createManagedBean(
        new TooltipFeature2({
          getGui: () => this.eMoveDownButton,
          getLocation: () => "advancedFilter",
          getTooltipValue: () => this.moveDownDisabled ? null : this.advancedFilterExpressionService.translate(
            "advancedFilterBuilderMoveDownButtonTooltip"
          )
        })
      );
      _setAriaLabel5(
        this.eMoveDownButton,
        this.advancedFilterExpressionService.translate("advancedFilterBuilderMoveDownButtonTooltip")
      );
      this.activateTabIndex([this.eMoveUpButton, this.eMoveDownButton]);
    } else {
      _setDisplayed4(this.eMoveUpButton, false);
      _setDisplayed4(this.eMoveDownButton, false);
    }
  }
  updateValidity() {
    _setVisible(this.eValidation, !this.item.valid);
    this.validationTooltipFeature.refreshToolTip();
    this.updateAriaLabel();
  }
  createPill(params) {
    const { key, displayValue, cssClass, update, ariaLabel } = params;
    const onUpdated = (key2) => {
      if (key2 == null) {
        return;
      }
      update(key2);
      this.dispatchLocalEvent({
        type: "advancedFilterBuilderValueChanged"
      });
    };
    if (params.isSelect) {
      const { getEditorParams, pickerAriaLabelKey, pickerAriaLabelValue } = params;
      const advancedFilterBuilderParams = this.gos.get("advancedFilterBuilderParams");
      const minPickerWidth = `${advancedFilterBuilderParams?.pillSelectMinWidth ?? 140}px`;
      const maxPickerWidth = `${advancedFilterBuilderParams?.pillSelectMaxWidth ?? 200}px`;
      const comp = this.createBean(
        new SelectPillComp({
          pickerAriaLabelKey,
          pickerAriaLabelValue,
          pickerType: "ag-list",
          value: {
            key,
            displayValue
          },
          valueFormatter: (value) => value == null ? null : value.displayValue ?? value.key,
          variableWidth: true,
          minPickerWidth,
          maxPickerWidth,
          getEditorParams,
          wrapperClassName: cssClass,
          ariaLabel
        })
      );
      this.addManagedListeners(comp, {
        fieldPickerValueSelected: ({ value }) => onUpdated(value?.key)
      });
      return comp;
    } else {
      const comp = this.createBean(
        new InputPillComp({
          value: displayValue,
          cssClass,
          type: this.getInputType(params.baseCellDataType),
          ariaLabel
        })
      );
      this.addManagedListeners(comp, { fieldValueChanged: ({ value }) => onUpdated(value) });
      return comp;
    }
  }
  getInputType(baseCellDataType) {
    switch (baseCellDataType) {
      case "text":
      case "object":
      case "boolean":
        return "text";
      case "number":
        return "number";
      case "date":
      case "dateString":
        return "date";
    }
  }
  setupDragging() {
    const dragSource = {
      type: DragSourceType2.AdvancedFilterBuilder,
      eElement: this.eDragHandle,
      dragItemName: () => this.ePillWrapper.getDragName(),
      getDefaultIconName: () => "notAllowed",
      getDragItem: () => ({}),
      onDragStarted: () => this.dragFeature.dispatchLocalEvent({
        type: "advancedFilterBuilderDragStarted",
        item: this.item
      }),
      onDragStopped: () => this.dragFeature.dispatchLocalEvent({
        type: "advancedFilterBuilderDragEnded"
      })
    };
    this.dragAndDropService.addDragSource(dragSource, true);
    this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
  }
  updateAriaLabel() {
    const wrapperLabel = this.ePillWrapper.getAriaLabel();
    const level = `${this.item.level + 1}`;
    const validationMessage = this.ePillWrapper.getValidationMessage();
    let ariaLabel;
    if (validationMessage) {
      ariaLabel = this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderItemValidation", [
        wrapperLabel,
        level,
        validationMessage
      ]);
    } else {
      ariaLabel = this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderItem", [
        wrapperLabel,
        level
      ]);
    }
    _setAriaLabel5(this.focusWrapper, ariaLabel);
  }
  updateAriaExpanded() {
    _removeAriaExpanded(this.focusWrapper);
    const { filterModel } = this.item;
    if (filterModel?.filterType === "join" && filterModel.conditions.length) {
      _setAriaExpanded(this.focusWrapper, true);
    }
  }
  removeItem() {
    this.dispatchLocalEvent({
      type: "advancedFilterBuilderRemoved",
      item: this.item
    });
  }
  moveItem(backwards) {
    this.dispatchLocalEvent({
      type: "advancedFilterBuilderMoved",
      item: this.item,
      backwards
    });
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/builder/advancedFilterBuilderComp.ts
var AdvancedFilterBuilderComp = class extends Component9 {
  constructor() {
    super(
      /* html */
      `
            <div role="presentation" class="ag-advanced-filter-builder" tabindex="-1">
                <div role="presentation" class="ag-advanced-filter-builder-list" data-ref="eList"></div>
                <div role="presentation" class="ag-advanced-filter-builder-button-panel">
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-apply-button" data-ref="eApplyFilterButton"></button>
                    <button class="ag-button ag-standard-button ag-advanced-filter-builder-cancel-button" data-ref="eCancelFilterButton"></button>
                </div>
            </div>`
    );
    this.eList = RefPlaceholder7;
    this.eApplyFilterButton = RefPlaceholder7;
    this.eCancelFilterButton = RefPlaceholder7;
    this.validationMessage = null;
  }
  wireBeans(beans) {
    this.filterManager = beans.filterManager;
    this.advancedFilterService = beans.advancedFilterService;
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  postConstruct() {
    const { showMoveButtons } = this.gos.get("advancedFilterBuilderParams") ?? {};
    this.showMove = !!showMoveButtons;
    this.addManagedPropertyListener("advancedFilterBuilderParams", ({ currentValue }) => {
      this.showMove = !!currentValue?.showMoveButtons;
      this.refreshList(false);
    });
    this.filterModel = this.setupFilterModel();
    this.setupVirtualList();
    this.dragFeature = this.createManagedBean(new AdvancedFilterBuilderDragFeature(this, this.virtualList));
    this.setupButtons();
  }
  refresh() {
    let indexToFocus = this.virtualList.getLastFocusedRow();
    this.setupFilterModel();
    this.validateItems();
    this.refreshList(false);
    if (indexToFocus != null) {
      if (!this.virtualList.getComponentAt(indexToFocus)) {
        indexToFocus = 0;
      }
      this.virtualList.focusRow(indexToFocus);
    }
  }
  getNumItems() {
    return this.items.length;
  }
  moveItem(item, destination) {
    if (!destination || !item) {
      return;
    }
    this.moveItemToIndex(item, destination.rowIndex, destination.position);
  }
  afterGuiAttached() {
    this.virtualList.focusRow(0);
  }
  setupVirtualList() {
    this.virtualList = this.createManagedBean(
      new VirtualList2({
        cssIdentifier: "advanced-filter-builder",
        ariaRole: "tree",
        listName: this.advancedFilterExpressionService.translate("ariaAdvancedFilterBuilderList")
      })
    );
    this.virtualList.setComponentCreator(this.createItemComponent.bind(this));
    this.virtualList.setComponentUpdater(this.updateItemComponent.bind(this));
    this.virtualList.setRowHeight(40);
    this.eList.appendChild(this.virtualList.getGui());
    this.virtualList.setModel({
      getRowCount: () => this.items.length,
      getRow: (index) => this.items[index],
      areRowsEqual: (oldRow, newRow) => oldRow === newRow
    });
    this.buildList();
    this.virtualList.refresh();
  }
  setupButtons() {
    this.eApplyFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilderApply");
    this.activateTabIndex([this.eApplyFilterButton]);
    this.addManagedElementListeners(this.eApplyFilterButton, {
      click: () => {
        this.advancedFilterService.setModel(this.filterModel);
        this.filterManager?.onFilterChanged({ source: "advancedFilter" });
        this.close();
      }
    });
    this.validationTooltipFeature = this.createManagedBean(
      new TooltipFeature3({
        getGui: () => this.eApplyFilterButton,
        getLocation: () => "advancedFilter",
        getTooltipValue: () => this.validationMessage,
        getTooltipShowDelayOverride: () => 1e3
      })
    );
    this.validate();
    const mouseListener = (isEnter) => this.addOrRemoveCssClass("ag-advanced-filter-builder-validation", isEnter);
    this.addManagedListeners(this.eApplyFilterButton, {
      mouseenter: () => mouseListener(true),
      mouseleave: () => mouseListener(false)
    });
    this.eCancelFilterButton.innerText = this.advancedFilterExpressionService.translate("advancedFilterBuilderCancel");
    this.activateTabIndex([this.eCancelFilterButton]);
    this.addManagedElementListeners(this.eCancelFilterButton, { click: () => this.close() });
  }
  removeItemFromParent(item) {
    const sourceParentIndex = item.parent.conditions.indexOf(item.filterModel);
    item.parent.conditions.splice(sourceParentIndex, 1);
    return sourceParentIndex;
  }
  moveItemToIndex(item, destinationRowIndex, destinationPosition) {
    const destinationItem = this.items[destinationRowIndex];
    const destinationIsParent = destinationItem.filterModel?.filterType === "join" && destinationPosition === "bottom";
    const destinationParent = destinationIsParent ? destinationItem.filterModel : destinationItem.parent;
    if (!destinationParent) {
      return;
    }
    if (this.isChildOrSelf(destinationParent, item.filterModel) || destinationItem === item) {
      return;
    }
    this.removeItemFromParent(item);
    let destinationParentIndex;
    if (destinationIsParent) {
      destinationParentIndex = 0;
    } else {
      destinationParentIndex = destinationParent.conditions.indexOf(destinationItem.filterModel);
      if (destinationParentIndex === -1) {
        destinationParentIndex = destinationParent.conditions.length;
      } else if (destinationPosition === "bottom") {
        destinationParentIndex += 1;
      }
    }
    destinationParent.conditions.splice(destinationParentIndex, 0, item.filterModel);
    this.refreshList(false);
  }
  isChildOrSelf(modelToCheck, potentialParentModel) {
    return modelToCheck === potentialParentModel || potentialParentModel.filterType === "join" && potentialParentModel.conditions.some((condition) => this.isChildOrSelf(modelToCheck, condition));
  }
  setupFilterModel() {
    const filterModel = this.formatFilterModel(this.advancedFilterService.getModel());
    this.stringifiedModel = JSON.stringify(filterModel);
    return filterModel;
  }
  formatFilterModel(filterModel) {
    filterModel = filterModel ?? {
      filterType: "join",
      type: "AND",
      conditions: []
    };
    if (filterModel.filterType !== "join") {
      filterModel = {
        filterType: "join",
        type: "AND",
        conditions: [filterModel]
      };
    }
    return filterModel;
  }
  buildList() {
    const parseFilterModel = (filterModel, items, level, parent) => {
      items.push({ filterModel, level, parent, valid: true, showMove: this.showMove });
      if (filterModel.filterType === "join") {
        filterModel.conditions.forEach(
          (childFilterModel) => parseFilterModel(childFilterModel, items, level + 1, filterModel)
        );
        if (level === 0) {
          items.push({ filterModel: null, level: level + 1, parent: filterModel, valid: true });
        }
      }
    };
    this.items = [];
    parseFilterModel(this.filterModel, this.items, 0);
  }
  refreshList(softRefresh) {
    if (!softRefresh) {
      const invalidModels = [];
      this.items.forEach((item) => {
        if (!item.valid) {
          invalidModels.push(item.filterModel);
        }
      });
      this.buildList();
      if (invalidModels.length) {
        this.items.forEach((item) => {
          if (item.filterModel && invalidModels.includes(item.filterModel)) {
            item.valid = false;
          }
        });
      }
    }
    this.virtualList.refresh(softRefresh);
    this.validate();
  }
  updateItemComponent(item, comp) {
    const index = this.items.indexOf(item);
    const populateTreeLines = (filterModel2, treeLines2) => {
      const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === filterModel2);
      const parentFilterModel = parentItem?.parent;
      if (parentFilterModel) {
        const { conditions } = parentFilterModel;
        populateTreeLines(parentFilterModel, treeLines2);
        treeLines2.push(conditions[conditions.length - 1] === filterModel2);
      }
    };
    const treeLines = [];
    const { filterModel } = item;
    if (filterModel) {
      populateTreeLines(filterModel, treeLines);
      treeLines[0] = false;
    }
    const showStartTreeLine = filterModel?.filterType === "join" && !!filterModel.conditions.length;
    comp.setState({
      disableMoveUp: index === 1,
      disableMoveDown: !this.canMoveDown(item, index),
      treeLines,
      showStartTreeLine
    });
  }
  createItemComponent(item, focusWrapper) {
    const itemComp = this.createBean(
      item.filterModel ? new AdvancedFilterBuilderItemComp(item, this.dragFeature, focusWrapper) : new AdvancedFilterBuilderItemAddComp(item, focusWrapper)
    );
    itemComp.addManagedListeners(itemComp, {
      advancedFilterBuilderRemoved: ({ item: item2 }) => this.removeItem(item2),
      advancedFilterBuilderValueChanged: () => this.validate(),
      advancedFilterBuilderAdded: ({ item: item2, isJoin }) => this.addItem(item2, isJoin),
      advancedFilterBuilderMoved: ({ item: item2, backwards }) => this.moveItemUpDown(item2, backwards)
    });
    if (itemComp instanceof AdvancedFilterBuilderItemComp) {
      this.updateItemComponent(item, itemComp);
    }
    return itemComp;
  }
  addItem(item, isJoin) {
    const { parent: itemParent, level, filterModel: itemFilterModel } = item;
    const itemIsJoin = itemFilterModel?.filterType === "join";
    const filterModel = isJoin ? {
      filterType: "join",
      type: "AND",
      conditions: []
    } : {};
    const parent = itemIsJoin ? itemFilterModel : itemParent;
    let insertIndex = itemIsJoin ? 0 : parent.conditions.indexOf(itemFilterModel);
    if (insertIndex >= 0) {
      if (!itemIsJoin) {
        insertIndex += 1;
      }
      parent.conditions.splice(insertIndex, 0, filterModel);
    } else {
      parent.conditions.push(filterModel);
    }
    let index = this.items.indexOf(item);
    const softRefresh = index >= 0;
    if (softRefresh) {
      if (item.filterModel) {
        index++;
      }
      const newItems = [
        {
          filterModel,
          level: itemIsJoin ? level + 1 : level,
          parent,
          valid: isJoin,
          showMove: this.showMove
        }
      ];
      this.items.splice(index, 0, ...newItems);
    }
    this.refreshList(softRefresh);
    if (softRefresh) {
      this.virtualList.getComponentAt(index)?.afterAdd();
    }
  }
  removeItem(item) {
    const parent = item.parent;
    const { filterModel } = item;
    const parentIndex = parent.conditions.indexOf(filterModel);
    parent.conditions.splice(parentIndex, 1);
    const isJoin = item.filterModel?.filterType === "join";
    const index = this.items.indexOf(item);
    const softRefresh = !isJoin && index >= 0;
    if (softRefresh) {
      this.items.splice(index, 1);
    }
    this.refreshList(softRefresh);
    if (index >= 0) {
      this.virtualList.focusRow(index);
    }
  }
  moveItemUpDown(item, backwards) {
    const itemIndex = this.items.indexOf(item);
    const destinationIndex = backwards ? itemIndex - 1 : itemIndex + 1;
    if (destinationIndex === 0 || !backwards && !this.canMoveDown(item, itemIndex)) {
      return;
    }
    const destinationItem = this.items[destinationIndex];
    const indexInParent = this.removeItemFromParent(item);
    const { level, filterModel, parent } = item;
    const {
      level: destinationLevel,
      filterModel: destinationFilterModel,
      parent: destinationParent
    } = destinationItem;
    if (backwards) {
      if (destinationLevel === level && destinationFilterModel.filterType === "join") {
        destinationFilterModel.conditions.push(filterModel);
      } else if (destinationLevel <= level) {
        const destinationIndex2 = destinationParent.conditions.indexOf(destinationFilterModel);
        destinationParent.conditions.splice(destinationIndex2, 0, filterModel);
      } else {
        const newParentItem = parent.conditions[indexInParent - 1];
        newParentItem.conditions.push(filterModel);
      }
    } else {
      if (destinationLevel === level) {
        if (destinationFilterModel.filterType === "join") {
          destinationFilterModel.conditions.splice(0, 0, filterModel);
        } else {
          const destinationIndex2 = destinationParent.conditions.indexOf(destinationFilterModel);
          destinationParent.conditions.splice(destinationIndex2 + 1, 0, filterModel);
        }
      } else {
        if (indexInParent < parent.conditions.length) {
          parent.conditions.splice(indexInParent + 1, 0, filterModel);
        } else {
          const parentItem = this.items.find((itemToCheck) => itemToCheck.filterModel === parent);
          const destinationIndex2 = parentItem.parent.conditions.indexOf(parentItem.filterModel) + 1;
          parentItem.parent.conditions.splice(destinationIndex2, 0, filterModel);
        }
      }
    }
    this.refreshList(false);
    const newIndex = this.items.findIndex(
      ({ filterModel: filterModelToCheck }) => filterModelToCheck === filterModel
    );
    if (newIndex >= 0) {
      const comp = this.virtualList.getComponentAt(newIndex);
      if (comp instanceof AdvancedFilterBuilderItemComp) {
        comp.focusMoveButton(backwards);
      }
    }
  }
  canMoveDown(item, index) {
    return !(item.level === 1 && index === this.items.length - 2 || item.level === 1 && item.parent.conditions[item.parent.conditions.length - 1] === item.filterModel);
  }
  close() {
    this.advancedFilterService.getCtrl().toggleFilterBuilder("ui");
  }
  validate() {
    let disableApply = !this.items.every(({ valid }) => valid);
    if (!disableApply) {
      disableApply = JSON.stringify(this.filterModel) === this.stringifiedModel;
      if (disableApply) {
        this.validationMessage = this.advancedFilterExpressionService.translate(
          "advancedFilterBuilderValidationAlreadyApplied"
        );
      } else {
        this.validationMessage = null;
      }
    } else {
      this.validationMessage = this.advancedFilterExpressionService.translate(
        "advancedFilterBuilderValidationIncomplete"
      );
    }
    _setDisabled2(this.eApplyFilterButton, disableApply);
    this.validationTooltipFeature.refreshToolTip();
  }
  validateItems() {
    const clearOperator = (filterModel) => {
      filterModel.type = void 0;
    };
    const clearOperand = (filterModel) => {
      delete filterModel.filter;
    };
    this.items.forEach((item) => {
      if (!item.valid || !item.filterModel || item.filterModel.filterType === "join") {
        return;
      }
      const { filterModel } = item;
      const { colId } = filterModel;
      const hasColumn = this.advancedFilterExpressionService.getColumnAutocompleteEntries().find(({ key }) => key === colId);
      const columnDetails = this.advancedFilterExpressionService.getColumnDetails(filterModel.colId);
      if (!hasColumn || !columnDetails.column) {
        item.valid = false;
        filterModel.colId = void 0;
        clearOperator(filterModel);
        clearOperand(filterModel);
        return;
      }
      const operatorForType = this.advancedFilterExpressionService.getDataTypeExpressionOperator(
        columnDetails.baseCellDataType
      );
      const operator = operatorForType.operators[filterModel.type];
      if (!operator) {
        item.valid = false;
        clearOperator(filterModel);
        clearOperand(filterModel);
        return;
      }
      if (operator.numOperands > 0 && !_exists6(filterModel.filter)) {
        item.valid = false;
        return;
      }
    });
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterCtrl.ts
var AdvancedFilterCtrl = class extends BeanStub4 {
  constructor(enabled) {
    super();
    this.enabled = enabled;
  }
  wireBeans(beans) {
    this.ctrlsService = beans.ctrlsService;
    this.popupService = beans.popupService;
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
    this.environment = beans.environment;
  }
  postConstruct() {
    this.hasAdvancedFilterParent = !!this.gos.get("advancedFilterParent");
    this.ctrlsService.whenReady(() => this.setAdvancedFilterComp());
    this.addManagedEventListeners({
      advancedFilterEnabledChanged: ({ enabled }) => this.onEnabledChanged(enabled)
    });
    this.addManagedPropertyListener("advancedFilterParent", () => this.updateComps());
    this.addDestroyFunc(() => {
      this.destroyAdvancedFilterComp();
      this.destroyBean(this.eBuilderComp);
      if (this.eBuilderDialog && this.eBuilderDialog.isAlive()) {
        this.destroyBean(this.eBuilderDialog);
      }
    });
  }
  setupHeaderComp(eCompToInsertBefore) {
    this.eHeaderComp = this.createManagedBean(
      new AdvancedFilterHeaderComp(this.enabled && !this.hasAdvancedFilterParent)
    );
    eCompToInsertBefore.insertAdjacentElement("beforebegin", this.eHeaderComp.getGui());
  }
  focusHeaderComp() {
    if (this.eHeaderComp) {
      this.eHeaderComp.getFocusableElement().focus();
      return true;
    }
    return false;
  }
  refreshComp() {
    this.eFilterComp?.refresh();
    this.eHeaderComp?.refresh();
  }
  refreshBuilderComp() {
    this.eBuilderComp?.refresh();
  }
  getHeaderHeight() {
    return this.eHeaderComp?.getHeight() ?? 0;
  }
  setInputDisabled(disabled) {
    this.eFilterComp?.setInputDisabled(disabled);
    this.eHeaderComp?.setInputDisabled(disabled);
  }
  toggleFilterBuilder(source, force) {
    if (force && this.eBuilderDialog || force === false && !this.eBuilderDialog) {
      return;
    }
    if (this.eBuilderDialog) {
      this.builderDestroySource = source;
      this.destroyBean(this.eBuilderDialog);
      return;
    }
    this.setInputDisabled(true);
    const { width, height, minWidth } = this.getBuilderDialogSize();
    this.eBuilderComp = this.createBean(new AdvancedFilterBuilderComp());
    this.eBuilderDialog = this.createBean(
      new AgDialog({
        title: this.advancedFilterExpressionService.translate("advancedFilterBuilderTitle"),
        component: this.eBuilderComp,
        width,
        height,
        resizable: true,
        movable: true,
        maximizable: true,
        centered: true,
        closable: true,
        minWidth,
        afterGuiAttached: () => this.eBuilderComp?.afterGuiAttached()
      })
    );
    this.dispatchFilterBuilderVisibleChangedEvent(source, true);
    this.eBuilderDialog.addEventListener("destroyed", () => {
      this.destroyBean(this.eBuilderComp);
      this.eBuilderComp = void 0;
      this.eBuilderDialog = void 0;
      this.setInputDisabled(false);
      this.dispatchLocalEvent({
        type: "advancedFilterBuilderClosed"
      });
      this.dispatchFilterBuilderVisibleChangedEvent(this.builderDestroySource ?? "ui", false);
      this.builderDestroySource = void 0;
    });
  }
  dispatchFilterBuilderVisibleChangedEvent(source, visible) {
    const event = {
      type: "advancedFilterBuilderVisibleChanged",
      source,
      visible
    };
    this.eventService.dispatchEvent(event);
  }
  getBuilderDialogSize() {
    const minWidth = this.gos.get("advancedFilterBuilderParams")?.minWidth ?? 500;
    const popupParent = this.popupService.getPopupParent();
    const maxWidth = Math.round(_getAbsoluteWidth(popupParent)) - 2;
    const maxHeight = Math.round(_getAbsoluteHeight(popupParent) * 0.75) - 2;
    const width = Math.min(Math.max(600, minWidth), maxWidth);
    const height = Math.min(600, maxHeight);
    return { width, height, minWidth };
  }
  onEnabledChanged(enabled) {
    this.enabled = enabled;
    this.updateComps();
  }
  updateComps() {
    this.setAdvancedFilterComp();
    this.setHeaderCompEnabled();
    this.eventService.dispatchEvent({
      type: "headerHeightChanged"
    });
  }
  setAdvancedFilterComp() {
    this.destroyAdvancedFilterComp();
    if (!this.enabled) {
      return;
    }
    const advancedFilterParent = this.gos.get("advancedFilterParent");
    this.hasAdvancedFilterParent = !!advancedFilterParent;
    if (advancedFilterParent) {
      const eAdvancedFilterComp = this.createBean(new AdvancedFilterComp());
      const eAdvancedFilterCompGui = eAdvancedFilterComp.getGui();
      this.environment.applyThemeClasses(eAdvancedFilterCompGui);
      eAdvancedFilterCompGui.classList.add(this.gos.get("enableRtl") ? "ag-rtl" : "ag-ltr");
      advancedFilterParent.appendChild(eAdvancedFilterCompGui);
      this.eFilterComp = eAdvancedFilterComp;
    }
  }
  setHeaderCompEnabled() {
    this.eHeaderComp?.setEnabled(this.enabled && !this.hasAdvancedFilterParent);
  }
  destroyAdvancedFilterComp() {
    if (this.eFilterComp) {
      _removeFromParent2(this.eFilterComp.getGui());
      this.destroyBean(this.eFilterComp);
    }
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/joinFilterExpressionParser.ts
var OperatorParser2 = class {
  constructor(params) {
    this.params = params;
    this.operators = [];
    this.operatorStartPositions = [];
    this.operatorEndPositions = [];
    this.activeOperator = 0;
    this.validationError = null;
  }
  parseExpression(i) {
    this.operators.push("");
    this.operatorStartPositions.push(i);
    this.operatorEndPositions.push(void 0);
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === " ") {
        const isComplete = this.parseOperator(i - 1);
        if (isComplete) {
          this.activeOperator++;
          return i - 1;
        } else {
          this.operators[this.activeOperator] += char;
        }
      } else {
        this.operators[this.activeOperator] += char;
      }
      i++;
    }
    this.parseOperator(i - 1);
    return i;
  }
  isValid() {
    return !this.validationError && (!this.operators.length || !!this.parsedOperator);
  }
  getValidationError() {
    return this.validationError;
  }
  getFunction() {
    return this.parsedOperator === "OR" ? "||" : "&&";
  }
  getModel() {
    return this.parsedOperator === "OR" ? "OR" : "AND";
  }
  getAutocompleteListParams(position, operatorIndex) {
    let searchString;
    if (operatorIndex == null) {
      searchString = "";
    } else {
      const operator = this.operators[operatorIndex];
      const operatorEndPosition = this.operatorEndPositions[operatorIndex];
      searchString = getSearchString(
        operator,
        position,
        operatorEndPosition == null ? this.params.expression.length : operatorEndPosition + 1
      );
    }
    let entries = this.params.advancedFilterExpressionService.getJoinOperatorAutocompleteEntries();
    if (operatorIndex || operatorIndex == null && this.activeOperator) {
      entries = entries.filter(({ key }) => key === this.parsedOperator);
    }
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      entries,
      "join",
      searchString
    );
  }
  updateExpression(position, updateEntry, operatorIndex) {
    let { expression } = this.params;
    const updatedValuePart = updateEntry.displayValue ?? updateEntry.key;
    if (operatorIndex === 0) {
      for (let i = this.operatorEndPositions.length - 1; i > 0; i--) {
        const operatorEndPosition = this.operatorEndPositions[i];
        if (operatorEndPosition == null) {
          continue;
        }
        expression = updateExpression(
          expression,
          this.operatorStartPositions[i],
          operatorEndPosition,
          updatedValuePart
        ).updatedValue;
      }
    }
    const startPosition = this.operatorStartPositions.length > operatorIndex ? this.operatorStartPositions[operatorIndex] : position;
    const endPosition = (this.operatorEndPositions.length > operatorIndex ? this.operatorEndPositions[operatorIndex] : void 0) ?? findEndPosition(expression, position, true).endPosition;
    return updateExpression(expression, startPosition, endPosition, updatedValuePart, true);
  }
  getNumOperators() {
    return this.operators.length;
  }
  getLastOperatorEndPosition() {
    return this.operatorEndPositions[this.operatorEndPositions.length - 1];
  }
  parseOperator(endPosition) {
    const operator = this.operators.length > this.activeOperator ? this.operators[this.activeOperator] : "";
    const joinOperators = this.params.advancedFilterExpressionService.getExpressionJoinOperators();
    const parsedValue = findMatch(operator, joinOperators, (v) => v);
    if (parsedValue) {
      this.operatorEndPositions[this.activeOperator] = endPosition;
      const displayValue = joinOperators[parsedValue];
      if (this.activeOperator) {
        if (parsedValue !== this.parsedOperator) {
          if (!this.validationError) {
            this.validationError = {
              message: this.params.advancedFilterExpressionService.translate(
                "advancedFilterValidationJoinOperatorMismatch"
              ),
              startPosition: endPosition - operator.length + 1,
              endPosition
            };
          }
          return false;
        }
      } else {
        this.parsedOperator = parsedValue;
      }
      if (operator !== displayValue) {
        checkAndUpdateExpression(this.params, operator, displayValue, endPosition);
        this.operators[this.activeOperator] = displayValue;
      }
      return true;
    } else if (parsedValue === null) {
      return false;
    } else {
      if (!this.validationError) {
        this.validationError = {
          message: this.params.advancedFilterExpressionService.translate(
            "advancedFilterValidationInvalidJoinOperator"
          ),
          startPosition: endPosition - operator.length + 1,
          endPosition
        };
      }
      return true;
    }
  }
};
var JoinFilterExpressionParser = class _JoinFilterExpressionParser {
  constructor(params, startPosition) {
    this.params = params;
    this.startPosition = startPosition;
    this.expectingExpression = true;
    this.expectingOperator = false;
    this.expressionParsers = [];
    this.operatorParser = new OperatorParser2(this.params);
    this.missingEndBracket = false;
    this.extraEndBracket = false;
  }
  parseExpression() {
    let i = this.startPosition;
    const { expression } = this.params;
    while (i < expression.length) {
      const char = expression[i];
      if (char === "(" && !this.expectingOperator) {
        const nestedParser = new _JoinFilterExpressionParser(this.params, i + 1);
        i = nestedParser.parseExpression();
        this.expressionParsers.push(nestedParser);
        this.expectingExpression = false;
        this.expectingOperator = true;
      } else if (char === ")") {
        this.endPosition = i - 1;
        if (this.startPosition === 0) {
          this.extraEndBracket = true;
        }
        return i;
      } else if (char === " ") {
      } else if (this.expectingExpression) {
        const nestedParser = new ColFilterExpressionParser(this.params, i);
        i = nestedParser.parseExpression();
        this.expressionParsers.push(nestedParser);
        this.expectingExpression = false;
        this.expectingOperator = true;
      } else if (this.expectingOperator) {
        i = this.operatorParser.parseExpression(i);
        this.expectingOperator = false;
        this.expectingExpression = true;
      }
      i++;
    }
    if (this.startPosition > 0) {
      this.missingEndBracket = true;
    }
    return i;
  }
  isValid() {
    return !this.missingEndBracket && !this.extraEndBracket && this.expressionParsers.length === this.operatorParser.getNumOperators() + 1 && this.operatorParser.isValid() && this.expressionParsers.every((expressionParser) => expressionParser.isValid());
  }
  getValidationError() {
    const operatorError = this.operatorParser.getValidationError();
    for (let i = 0; i < this.expressionParsers.length; i++) {
      const expressionError = this.expressionParsers[i].getValidationError();
      if (expressionError) {
        return operatorError && operatorError.startPosition < expressionError.startPosition ? operatorError : expressionError;
      }
    }
    if (operatorError) {
      return operatorError;
    }
    if (this.extraEndBracket) {
      return {
        message: this.params.advancedFilterExpressionService.translate(
          "advancedFilterValidationExtraEndBracket"
        ),
        startPosition: this.endPosition + 1,
        endPosition: this.endPosition + 1
      };
    }
    let translateKey;
    if (this.expressionParsers.length === this.operatorParser.getNumOperators()) {
      translateKey = "advancedFilterValidationMissingCondition";
    } else if (this.missingEndBracket) {
      translateKey = "advancedFilterValidationMissingEndBracket";
    }
    if (translateKey) {
      return {
        message: this.params.advancedFilterExpressionService.translate(translateKey),
        startPosition: this.params.expression.length,
        endPosition: this.params.expression.length
      };
    }
    return null;
  }
  getFunctionString(params) {
    const hasMultipleExpressions = this.expressionParsers.length > 1;
    const expression = this.expressionParsers.map((expressionParser) => expressionParser.getFunctionString(params)).join(` ${this.operatorParser.getFunction()} `);
    return hasMultipleExpressions ? `(${expression})` : expression;
  }
  getFunctionParsed(params) {
    const operator = this.operatorParser.getFunction();
    const funcs = this.expressionParsers.map((expressionParser) => expressionParser.getFunctionParsed(params));
    const arrayFunc = operator === "&&" ? "every" : "some";
    return (expressionProxy, node, p) => funcs[arrayFunc]((func) => func(expressionProxy, node, p));
  }
  getAutocompleteListParams(position) {
    if (this.endPosition != null && position > this.endPosition + 1) {
      return void 0;
    }
    if (!this.expressionParsers.length) {
      return this.getColumnAutocompleteListParams();
    }
    const expressionParserIndex = this.getExpressionParserIndex(position);
    if (expressionParserIndex == null) {
      if (this.params.expression[position] === "(") {
        return { enabled: false };
      }
      return this.getColumnAutocompleteListParams();
    }
    const expressionParser = this.expressionParsers[expressionParserIndex];
    const autocompleteType = expressionParser.getAutocompleteListParams(position);
    if (!autocompleteType) {
      if (expressionParserIndex < this.expressionParsers.length - 1) {
        return this.operatorParser.getAutocompleteListParams(position, expressionParserIndex);
      }
      if (this.expressionParsers.length === this.operatorParser.getNumOperators()) {
        const operatorEndPosition = this.operatorParser.getLastOperatorEndPosition();
        return operatorEndPosition == null || position <= operatorEndPosition + 1 ? this.operatorParser.getAutocompleteListParams(position, this.operatorParser.getNumOperators() - 1) : this.getColumnAutocompleteListParams();
      }
      if (this.params.expression[position - 1] === ")") {
        return { enabled: false };
      }
      return this.operatorParser.getAutocompleteListParams(position);
    }
    return autocompleteType;
  }
  updateExpression(position, updateEntry, type) {
    const expression = this.params.expression;
    const expressionParserIndex = this.getExpressionParserIndex(position);
    if (expressionParserIndex == null) {
      const updatedValuePart = type === "column" ? this.params.advancedFilterExpressionService.getColumnValue(updateEntry) : updateEntry.displayValue ?? updateEntry.key;
      return updateExpression(expression, this.startPosition, this.startPosition, updatedValuePart, true);
    }
    const expressionParser = this.expressionParsers[expressionParserIndex];
    const updatedExpression = expressionParser.updateExpression(position, updateEntry, type);
    if (updatedExpression == null) {
      if (type === "column") {
        return updateExpression(
          expression,
          position,
          expression.length - 1,
          this.params.advancedFilterExpressionService.getColumnValue(updateEntry),
          true
        );
      } else if (this.endPosition != null && position > this.endPosition + 1) {
        return null;
      } else {
        return this.operatorParser.updateExpression(position, updateEntry, expressionParserIndex);
      }
    }
    return updatedExpression;
  }
  getModel() {
    if (this.expressionParsers.length > 1) {
      return {
        filterType: "join",
        type: this.operatorParser.getModel(),
        conditions: this.expressionParsers.map((parser) => parser.getModel())
      };
    } else {
      return this.expressionParsers[0].getModel();
    }
  }
  getColumnAutocompleteListParams() {
    return this.params.advancedFilterExpressionService.generateAutocompleteListParams(
      this.params.advancedFilterExpressionService.getColumnAutocompleteEntries(),
      "column",
      ""
    );
  }
  getExpressionParserIndex(position) {
    let expressionParserIndex;
    for (let i = 0; i < this.expressionParsers.length; i++) {
      const expressionParserToCheck = this.expressionParsers[i];
      if (expressionParserToCheck.startPosition > position) {
        break;
      }
      expressionParserIndex = i;
    }
    return expressionParserIndex;
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/filterExpressionParser.ts
var FilterExpressionParser = class {
  constructor(params) {
    this.params = params;
    this.valid = false;
  }
  parseExpression() {
    this.joinExpressionParser = new JoinFilterExpressionParser(this.params, 0);
    const i = this.joinExpressionParser.parseExpression();
    this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
    return this.params.expression;
  }
  isValid() {
    return this.valid;
  }
  getValidationMessage() {
    const error = this.joinExpressionParser.getValidationError();
    if (!error) {
      return null;
    }
    const { message, startPosition, endPosition } = error;
    return startPosition < this.params.expression.length ? this.params.advancedFilterExpressionService.translate("advancedFilterValidationMessage", [
      message,
      this.params.expression.slice(startPosition, endPosition + 1).trim()
    ]) : this.params.advancedFilterExpressionService.translate("advancedFilterValidationMessageAtEnd", [message]);
  }
  getFunctionString() {
    const params = this.createFunctionParams();
    return {
      functionString: `return ${this.joinExpressionParser.getFunctionString(params)};`,
      params
    };
  }
  getFunctionParsed() {
    const params = this.createFunctionParams();
    return {
      expressionFunction: this.joinExpressionParser.getFunctionParsed(params),
      params
    };
  }
  getAutocompleteListParams(position) {
    return this.joinExpressionParser.getAutocompleteListParams(position) ?? { enabled: false };
  }
  updateExpression(position, updateEntry, type) {
    return this.joinExpressionParser.updateExpression(position, updateEntry, type);
  }
  getModel() {
    return this.isValid() ? this.joinExpressionParser.getModel() : null;
  }
  createFunctionParams() {
    return {
      operands: [],
      operators: [],
      evaluatorParams: []
    };
  }
};

// enterprise-modules/advanced-filter/src/advancedFilter/advancedFilterService.ts
var AdvancedFilterService = class extends BeanStub5 {
  constructor() {
    super(...arguments);
    this.beanName = "advancedFilterService";
    this.appliedExpression = null;
    /** The value displayed in the input, which may be invalid */
    this.expression = null;
    this.isValid = true;
  }
  wireBeans(beans) {
    this.valueService = beans.valueService;
    this.columnModel = beans.columnModel;
    this.dataTypeService = beans.dataTypeService;
    this.rowModel = beans.rowModel;
    this.advancedFilterExpressionService = beans.advancedFilterExpressionService;
  }
  postConstruct() {
    this.setEnabled(this.gos.get("enableAdvancedFilter"), true);
    this.ctrl = this.createManagedBean(new AdvancedFilterCtrl(this.enabled));
    this.expressionProxy = {
      getValue: (colId, node) => {
        const column = this.columnModel.getColDefCol(colId);
        return column ? this.valueService.getValue(column, node, true) : void 0;
      }
    };
    this.addManagedPropertyListener("enableAdvancedFilter", (event) => this.setEnabled(!!event.currentValue));
    this.addManagedEventListeners({
      newColumnsLoaded: (event) => this.onNewColumnsLoaded(event)
    });
    this.addManagedPropertyListener("includeHiddenColumnsInAdvancedFilter", () => this.updateValidity());
  }
  isEnabled() {
    return this.enabled;
  }
  isFilterPresent() {
    return !!this.expressionFunction;
  }
  doesFilterPass(node) {
    return this.expressionFunction(this.expressionProxy, node, this.expressionParams);
  }
  getModel() {
    const expressionParser = this.createExpressionParser(this.appliedExpression);
    expressionParser?.parseExpression();
    return expressionParser?.getModel() ?? null;
  }
  setModel(model) {
    const parseModel = (model2, isFirstParent) => {
      if (model2.filterType === "join") {
        const operator = this.advancedFilterExpressionService.parseJoinOperator(model2);
        const expression2 = model2.conditions.map((condition) => parseModel(condition)).filter((condition) => _exists7(condition)).join(` ${operator} `);
        return isFirstParent || model2.conditions.length <= 1 ? expression2 : `(${expression2})`;
      } else {
        return this.advancedFilterExpressionService.parseColumnFilterModel(model2);
      }
    };
    const expression = model ? parseModel(model, true) : null;
    this.setExpressionDisplayValue(expression);
    this.applyExpression();
    this.ctrl.refreshComp();
    this.ctrl.refreshBuilderComp();
  }
  getExpressionDisplayValue() {
    return this.expression;
  }
  setExpressionDisplayValue(expression) {
    this.expression = expression;
  }
  isCurrentExpressionApplied() {
    return this.appliedExpression === this.expression;
  }
  createExpressionParser(expression) {
    if (!expression) {
      return null;
    }
    return new FilterExpressionParser({
      expression,
      columnModel: this.columnModel,
      dataTypeService: this.dataTypeService,
      valueService: this.valueService,
      advancedFilterExpressionService: this.advancedFilterExpressionService
    });
  }
  getDefaultExpression(updateEntry) {
    const updatedValue = this.advancedFilterExpressionService.getColumnValue(updateEntry) + " ";
    return {
      updatedValue,
      updatedPosition: updatedValue.length
    };
  }
  isHeaderActive() {
    return !this.gos.get("advancedFilterParent");
  }
  getCtrl() {
    return this.ctrl;
  }
  setEnabled(enabled, silent) {
    const previousValue = this.enabled;
    const rowModelType = this.rowModel.getType();
    const isValidRowModel = rowModelType === "clientSide" || rowModelType === "serverSide";
    if (enabled && !rowModelType) {
      _warnOnce("Advanced Filter is only supported with the Client-Side Row Model or Server-Side Row Model.");
    }
    this.enabled = enabled && isValidRowModel;
    if (!silent && this.enabled !== previousValue) {
      const event = {
        type: "advancedFilterEnabledChanged",
        enabled: this.enabled
      };
      this.eventService.dispatchEvent(event);
    }
  }
  applyExpression() {
    const expressionParser = this.createExpressionParser(this.expression);
    expressionParser?.parseExpression();
    this.applyExpressionFromParser(expressionParser);
  }
  applyExpressionFromParser(expressionParser) {
    this.isValid = !expressionParser || expressionParser.isValid();
    if (!expressionParser || !this.isValid) {
      this.expressionFunction = null;
      this.expressionParams = null;
      this.appliedExpression = null;
      return;
    }
    const { expressionFunction, params } = this.getFunction(expressionParser);
    this.expressionFunction = expressionFunction;
    this.expressionParams = params;
    this.appliedExpression = this.expression;
  }
  getFunction(expressionParser) {
    if (this.gos.get("suppressAdvancedFilterEval")) {
      return expressionParser.getFunctionParsed();
    } else {
      const { functionString, params } = expressionParser.getFunctionString();
      return {
        expressionFunction: new Function(
          "expressionProxy",
          "node",
          "params",
          functionString
        ),
        params
      };
    }
  }
  updateValidity() {
    this.advancedFilterExpressionService.resetColumnCaches();
    const expressionParser = this.createExpressionParser(this.expression);
    expressionParser?.parseExpression();
    const isValid = !expressionParser || expressionParser.isValid();
    const updatedValidity = isValid !== this.isValid;
    this.applyExpressionFromParser(expressionParser);
    this.ctrl.refreshComp();
    this.ctrl.refreshBuilderComp();
    return updatedValidity;
  }
  onNewColumnsLoaded(event) {
    if (event.source !== "gridInitializing" || !this.dataTypeService?.isPendingInference()) {
      return;
    }
    this.ctrl.setInputDisabled(true);
    const [destroyFunc] = this.addManagedEventListeners({
      dataTypesInferred: () => {
        destroyFunc?.();
        this.ctrl.setInputDisabled(false);
      }
    });
  }
};

// enterprise-modules/advanced-filter/src/version.ts
var VERSION = "32.0.1";

// enterprise-modules/advanced-filter/src/advancedFilterModule.ts
var AdvancedFilterCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.AdvancedFilterModule}-core`,
  beans: [AdvancedFilterService, AdvancedFilterExpressionService],
  dependantModules: [EnterpriseCoreModule, _FilterCoreModule]
};
var AdvancedFilterApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.AdvancedFilterModule}-api`,
  apiFunctions: {
    getAdvancedFilterModel,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
    hideAdvancedFilterBuilder
  },
  dependantModules: [AdvancedFilterCoreModule]
};
var AdvancedFilterModule = {
  version: VERSION,
  moduleName: ModuleNames.AdvancedFilterModule,
  dependantModules: [AdvancedFilterCoreModule, AdvancedFilterApiModule]
};
export {
  AdvancedFilterModule
};
