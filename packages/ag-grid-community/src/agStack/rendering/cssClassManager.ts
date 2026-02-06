export class CssClassManager {
    private readonly getGui: () => HTMLElement | undefined | null;

    // to minimise DOM hits, we only apply CSS classes if they have changed. as adding a CSS class that is already
    // there, or removing one that wasn't present, all takes CPU.
    private cssClassStates: { [cssClass: string]: boolean } = {};

    constructor(getGui: () => HTMLElement | undefined | null) {
        this.getGui = getGui;
    }

    public toggleCss(className: string, addOrRemove: boolean): void {
        if (!className) {
            return;
        }

        // we check for spaces before doing the split, as doing the split
        // created a performance problem (on windows only, see AG-6765)
        if (className.includes(' ')) {
            const list = (className || '').split(' ');
            if (list.length > 1) {
                for (const cls of list) {
                    this.toggleCss(cls, addOrRemove);
                }
                return;
            }
        }

        const updateNeeded = this.cssClassStates[className] !== addOrRemove;
        if (updateNeeded && className.length) {
            this.getGui()?.classList.toggle(className, addOrRemove);

            this.cssClassStates[className] = addOrRemove;
        }
    }
}
