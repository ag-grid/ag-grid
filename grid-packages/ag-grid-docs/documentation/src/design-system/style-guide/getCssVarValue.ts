const bodyStyles = window.getComputedStyle(document.body);

export const getCssVarValue = (cssVar) => {
    return bodyStyles.getPropertyValue(cssVar);
};
