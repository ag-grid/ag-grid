export class CssClassManager {

    private getGui: () => HTMLElement;

    // to minimise DOM hits, we only apply CSS classes if they have changed. as adding a CSS class that is already
    // there, or removing one that wasn't present, all takes CPU.
    private cssClassStates: { [cssClass: string]: boolean } = {};

    constructor(getGui: () => HTMLElement) {
        this.getGui = getGui;
    }

    public addCssClass(className: string): void {
        const list = (className || '').split(' ');

        if (list.length > 1) {
            list.forEach(cls => this.addCssClass(cls));
            return;
        }

        const updateNeeded = this.cssClassStates[className] !== true;
        if (updateNeeded && className.length) {
            this.getGui().classList.add(className);
            this.cssClassStates[className] = true;
        }
    }

    public removeCssClass(className: string): void {
        const list = (className || '').split(' ');

        if (list.length > 1) {
            list.forEach(cls => this.removeCssClass(cls));
            return;
        }

        const updateNeeded = this.cssClassStates[className] !== false;
        if (updateNeeded && className.length) {
            this.getGui().classList.remove(className);
            this.cssClassStates[className] = false;
        }
    }

    public containsCssClass(className: string): boolean {
        return this.getGui().classList.contains(className);
    }

    public addOrRemoveCssClass(className: string, addOrRemove: boolean): void {
        if (!className) { return; }

        // we check for spaces before doing the split, as doing the split
        // created a performance problem (on windows only, see AG-6765)
        if (className.indexOf(' ') >= 0) {
            const list = (className || '').split(' ');
            if (list.length > 1) {
                list.forEach(cls => this.addOrRemoveCssClass(cls, addOrRemove));
                return;
            }
        }

        const updateNeeded = this.cssClassStates[className] !== addOrRemove;
        if (updateNeeded && className.length) {
            this.getGui().classList.toggle(className, addOrRemove);
            this.cssClassStates[className] = addOrRemove;
        }
    }
}