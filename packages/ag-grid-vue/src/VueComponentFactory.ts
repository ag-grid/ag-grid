/* tslint:disable:max-classes-per-file */
import Vue, {VueConstructor} from 'vue';
import {ICellRendererParams,
    ICellEditorParams,
    IFilterParams,
    IAfterGuiAttachedParams,
    IDoesFilterPassParams} from 'ag-grid-community';

export class VueComponentFactory {

    public static getComponentType(parent: any, component: any) {
        console.log('spl test string variation!!!!');
        if (typeof component === 'string') {
            // spl test this!!!
            const componentInstance: VueConstructor = parent.$parent.$options.components![component] as VueConstructor;
            if (!componentInstance) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
            return Vue.extend(componentInstance);
        } else {
            // assume a type
            return component;
        }
    }

    public static createAndMountComponent(params: any, componentType: any, parent: any) {
        const details = {
            data: {
                params: Object.freeze(params),
            },
            parent,
            router: (parent as any).$router,
            store: (parent as any).$store,
        };

        const component = new componentType(details);
        component.$mount();
        return component;
    }
    private $el: HTMLElement;
    private parent: any;

    constructor($el: HTMLElement, parent: any) {
        this.$el = $el;
        this.parent = parent;
    }

    public createRendererFromComponent(component: any): any {
        console.log('component type', component);
        const parent = this.parent;
        const componentType = VueComponentFactory.getComponentType(parent, component);
        if (!componentType) {
            return;
        }

        class CellRendererComponent {
            private component: any;

            public init(params: ICellRendererParams) {
                this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
            }

            public getGui() {
                return this.component.$el;
            }

            public destroy() {
                this.component.$destroy();
            }
        }

        return CellRendererComponent;
    }

    public createEditorFromComponent(component: any): any {
        const parent = this.parent;
        const componentType = VueComponentFactory.getComponentType(parent, component);
        if (!componentType) {
            return;
        }

        class CellEditor {
            private component: any;

            public init(params: ICellEditorParams) {
                this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
            }

            public getValue() {
                return this.component.getValue();
            }

            public getGui() {
                return this.component.$el;
            }

            public destroy() {
                this.component.$destroy();
            }

            public isPopup() {
                return this.component.isPopup ?
                    this.component.isPopup() : false;
            }

            public isCancelBeforeStart() {
                return this.component.isCancelBeforeStart ?
                    this.component.isCancelBeforeStart() : false;
            }

            public isCancelAfterEnd() {
                return this.component.isCancelAfterEnd ?
                    this.component.isCancelAfterEnd() : false;
            }

            public focusIn() {
                if (this.component.focusIn) {
                    this.component.focusIn();
                }
            }

            public focusOut() {
                if (this.component.focusOut) {
                    this.component.focusOut();
                }
            }
        }

        return CellEditor;
    }

    public createFilterFromComponent(component: any): any {
        const parent = this.parent;
        const componentType = VueComponentFactory.getComponentType(parent, component);
        if (!componentType) {
            return;
        }

        class Filter {
            private component: any;

            public init(params: IFilterParams) {
                this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
            }

            public getGui() {
                return this.component.$el;
            }

            public destroy() {
                this.component.$destroy();
            }

            public isFilterActive() {
                return this.component.isFilterActive();
            }

            public doesFilterPass(params: IDoesFilterPassParams) {
                return this.component.doesFilterPass(params);
            }

            public getModel() {
                return this.component.getModel();
            }

            public setModel(model: any) {
                this.component.setModel(model);
            }

            public afterGuiAttached(params: IAfterGuiAttachedParams) {
                if (this.component.afterGuiAttached) {
                    this.component.afterGuiAttached(params);
                }
            }

            public getFrameworkComponentInstance() {
                return this.component;
            }
        }

        return Filter;
    }
}
