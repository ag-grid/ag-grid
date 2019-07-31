// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class Environment {
    private eGridDiv;
    getSassVariable(theme: string, key: string): number;
    isThemeDark(): boolean;
    getTheme(): string | undefined;
}
