export const getCssVarValue = (cssVar) => {
    const IS_SSR = typeof window === 'undefined';

    if (IS_SSR) {
        return null;
    } else {
        const bodyStyles = window.getComputedStyle(document.body);

        return bodyStyles.getPropertyValue(cssVar);
    }
};
