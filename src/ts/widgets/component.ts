import _ from '../utils';

export class Component {

    private eGui: HTMLElement;

    private destroyFunctions: (()=>void)[] = [];

    constructor(template: string) {
        this.eGui = _.loadTemplate(template);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    protected queryForHtmlElement(cssSelector: string): HTMLElement {
        return <HTMLElement> this.eGui.querySelector(cssSelector);
    }

    protected queryForHtmlInputElement(cssSelector: string): HTMLInputElement {
        return <HTMLInputElement> this.eGui.querySelector(cssSelector);
    }

    public appendChild(newChild: Node): void {
        this.eGui.appendChild(newChild);
    }

    public setVisible(visible: boolean): void {
        _.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
    }

    public destroy(): void {
        this.destroyFunctions.forEach( func => func() );
    }

    public addDestroyableEventListener(eElement: HTMLElement, event: string, listener: ()=>void): void {
        eElement.addEventListener(event, listener);
        this.destroyFunctions.push( ()=> {
            eElement.removeEventListener(event, listener);
        });
    }

    public addDestroyFunc(func: ()=>void ): void {
        this.destroyFunctions.push(func);
    }
}