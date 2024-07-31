import type { CellStyle } from '../entities/colDef';

export class CssStyleManager {
    private getGui: () => HTMLElement | undefined | null;

    // to minimise DOM hits, we only apply CSS styles if they have changed. as adding a CSS style that is already
    // there, or removing one that wasn't present, all takes CPU.
    private cssStyles: CellStyle = {};

    constructor(getGui: () => HTMLElement | undefined | null, initialStyles: CellStyle = {}) {
        this.getGui = getGui;
        this.cssStyles = initialStyles;
    }

    public updateCssStyle(property: keyof CSSStyleDeclaration & string, value: string): void {
        const updateNeeded = this.cssStyles[property] !== value;
        if (updateNeeded) {
            const eGui = this.getGui();
            if (eGui) {
                if (value === null || value === undefined) {
                    eGui.style.removeProperty(property);
                }
                {
                    eGui.style.setProperty(property, value);
                }
            }
            this.cssStyles[property] = value;
        }
    }

    public getStyles() {
        // Return a copy so React can mark it read-only
        return { ...this.cssStyles };
    }
}
