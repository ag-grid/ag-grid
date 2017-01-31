export default (function () {
    function VueComponentFactory($el, parent) {
        this.$el = $el;
        this.parent = parent;
    }

    VueComponentFactory.prototype.createRendererFromComponent = function (component) {
        // let that = this;
        let CellRendererComponent = (function () {
            function CellRendererComponent() {
            }
            CellRendererComponent.prototype.init = function (params) {
                let details = {
                    // parent: that.parent,
                    data: {
                        params: params
                    }
                };
                this.component = new component(details);
                this.component.$mount();
            };
            CellRendererComponent.prototype.getGui = function () {
                return this.component.$el;
            };
            CellRendererComponent.prototype.destroy = function () {
                this.component.$destroy();
                console.log()
            };
            return CellRendererComponent;
        }());

        return CellRendererComponent;
    };

    VueComponentFactory.prototype.createEditorFromComponent = function (component) {
    };

    VueComponentFactory.prototype.createFilterFromComponent = function (component) {
    };

    return VueComponentFactory;
}());