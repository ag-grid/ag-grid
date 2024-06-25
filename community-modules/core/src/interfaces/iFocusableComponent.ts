export interface FocusableComponent {
    getGui(): HTMLElement;
    setAllowFocus?(allowFocus: boolean): void;
}
