class BaseGuiComponent {
    constructor(element) {
        this.element = element;
    }

    init(params) {
        this._params = params;

        this._agAwareComponent = this.createComponent();
        this._agAwareComponent.agInit(this._params);
    }

    getGui() {
        return this._agAwareComponent;
    }

    destroy() {
        if (this._agAwareComponent && this._agAwareComponent.destroy) {
            this._agAwareComponent.destroy();
        }
    }

    getFrameworkComponentInstance() {
        return this._agAwareComponent;
    }

    createComponent() {
        if(!customElements.get(this.element)) {
            console.error(`${this.element} not found in the registry - has it been registered?`)
        }
        return document.createElement(this.element);
    }
}