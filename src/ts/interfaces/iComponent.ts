
export interface IComponent<T> {

    init?(params: T): void;

    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;

    /** A hook to perform any necessary operation just after the gui for this component has been renderer
     * in the screen*/
    afterGuiAttached?(params?: any): void;
}