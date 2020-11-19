import {waitForAsyncCondition} from "../../src/__tests__/utils";

export const ensureGridApiHasBeenSet = component => {
    return waitForAsyncCondition(() => {
        return window.gridComponentInstance && window.gridComponentInstance.api !== undefined
    }, 5)
};


// https://stackoverflow.com/questions/7444451/how-to-get-the-actual-rendered-font-when-its-not-defined-in-css
export const cssProperty = (element, property) => window.getComputedStyle(element, null).getPropertyValue(property);

// https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
export const getTextWidth = (text, font) => {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
};

