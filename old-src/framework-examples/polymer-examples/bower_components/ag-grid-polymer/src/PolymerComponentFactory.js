class PolymerComponentFactory {
    createRendererFromComponent(componentType) {
        return this.adaptComponentToRenderer(componentType);
    }

    createEditorFromComponent(componentType) {
        return this.adaptComponentToEditor(componentType);
    }

    createFilterFromComponent(componentType) {
        return this.adaptComponentToFilter(componentType);
    }

    adaptComponentToRenderer(componentType) {
        let that = this;
        class CellRenderer extends BaseGuiComponent {
            constructor() {
                super(componentType);
            }

            init(params) {
                super.init(params);
            }

            refresh(params) {
                this._params = params;

                if (this._agAwareComponent.refresh) {
                    this._agAwareComponent.refresh(params);
                    return true;
                } else {
                    return false;
                }
            }
        }

        return CellRenderer;
    }

    adaptComponentToEditor(componentType) {
        let that = this;
        class CellEditor extends BaseGuiComponent {
            constructor() {
                super(componentType);
            }

            init(params) {
                super.init(params);
            }

            getValue() {
                return this._agAwareComponent.getValue();
            }

            isPopup() {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            }

            isCancelBeforeStart() {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            }

            isCancelAfterEnd() {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
            }

            focusIn() {
                if (this._agAwareComponent.focusIn) {
                    this._agAwareComponent.focusIn();
                }
            }

            focusOut() {
                if (this._agAwareComponent.focusOut) {
                    this._agAwareComponent.focusOut();
                }
            }
        }

        return CellEditor;
    }

    adaptComponentToFilter(componentType) {
        let that = this;
        class Filter extends BaseGuiComponent {
            constructor() {
                super(componentType);
            }

            init(params) {
                super.init(params);
            }

            isFilterActive() {
                return this._agAwareComponent.isFilterActive();
            }

            doesFilterPass(params) {
                return this._agAwareComponent.doesFilterPass(params);
            }

            getModel() {
                return this._agAwareComponent.getModel();
            }

            setModel(model) {
                this._agAwareComponent.setModel(model);
            }

            afterGuiAttached(params) {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            }

            onNewRowsLoaded() {
                if (this._agAwareComponent.onNewRowsLoaded) {
                    this._agAwareComponent.onNewRowsLoaded();
                }
            }

            getModelAsString(model) {
                let agAwareComponent = this._agAwareComponent;
                if (agAwareComponent.getModelAsString) {
                    return agAwareComponent.getModelAsString(model);
                }
                return null;
            }

            getFrameworkComponentInstance() {
                return this._agAwareComponent;
            }
        }

        return Filter;
    }
}