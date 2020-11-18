import {waitForAsyncCondition} from "../../src/__tests__/utils";

export const ensureGridApiHasBeenSet = component => {
    return waitForAsyncCondition(() => {
        return window.gridComponentInstance && window.gridComponentInstance.api !== undefined
    }, 5)
};
