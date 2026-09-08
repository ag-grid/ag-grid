/**
 * Legacy theme variables with no Theming API equivalent of the same name, mapped to the variable
 * that replaces them. Deliberately limited to cases where the replacement is unambiguous, as this
 * drives a warning - variables that both theming systems read must never be listed here.
 */
const LEGACY_ONLY_VARIABLES: Record<string, string> = {
    '--ag-grid-size': '--ag-spacing',
    '--ag-active-color': '--ag-accent-color',
    '--ag-alpine-active-color': '--ag-accent-color',
    '--ag-balham-active-color': '--ag-accent-color',
    '--ag-material-primary-color': '--ag-accent-color',
    '--ag-header-foreground-color': '--ag-header-text-color',
    '--ag-control-panel-background-color': '--ag-chrome-background-color',
    '--ag-cell-horizontal-border': '--ag-column-border',
    '--ag-header-column-separator-color': '--ag-header-column-border',
};

/**
 * Returns the legacy-only theme variables set on the given element, each paired with the Theming
 * API variable that replaces it, in the form reported to the user. Empty if none are set.
 */
export function _findLegacyOnlyVariables(eRootDiv: HTMLElement): string[] {
    const style = getComputedStyle(eRootDiv);
    const replacements: string[] = [];
    for (const legacyName of Object.keys(LEGACY_ONLY_VARIABLES)) {
        if (style.getPropertyValue(legacyName).trim()) {
            replacements.push(`${legacyName} (use ${LEGACY_ONLY_VARIABLES[legacyName]})`);
        }
    }
    return replacements;
}
