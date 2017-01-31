import Vue from "vue";

export class VueComponentFactory {
    constructor($el, parent) {
        this.$el = $el;
        this.parent = parent;
    }

    createRendererFromComponent(component) {
        let componentType = this.getComponentType(component);
        if(!componentType) {
            return;
        }

        class CellRendererComponent {
            init(params) {
                let details = {
                    // parent: that.parent,
                    data: {
                        params: params
                    }
                };
                this.component = new componentType(details);
                this.component.$mount();
            }

            getGui() {
                return this.component.$el;
            }

            destroy() {
                this.component.$destroy();
            }
        }

        return CellRendererComponent;
    }

    createEditorFromComponent(component) {
    }

    createFilterFromComponent(component) {
    }

    getComponentType(component) {
        if(typeof component ==='string') {
            let componentInstance = this.parent.$parent.$options.components[component];
            if(!componentInstance) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
            return Vue.extend(componentInstance)
        } else {
            // assume a type
            return component;
        }
    }
}