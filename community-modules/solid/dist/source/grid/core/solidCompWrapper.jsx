export default class SolidCompWrapper {
    eGui;
    SolidCompClass;
    portalManager;
    portalInfo;
    instance;
    constructor(SolidCompClass, portalManager) {
        this.SolidCompClass = SolidCompClass;
        this.portalManager = portalManager;
    }
    init(props) {
        this.eGui = document.createElement('div');
        this.eGui.className = 'ag-solid-container';
        this.portalInfo = {
            mount: this.eGui,
            SolidClass: this.SolidCompClass,
            props,
            ref: instance => {
                this.instance = instance;
            }
        };
        this.portalManager.addPortal(this.portalInfo);
    }
    destroy() {
        this.portalInfo && this.portalManager.removePortal(this.portalInfo);
    }
    getGui() {
        return this.eGui;
    }
    hasMethod(name) {
        return this.instance[name] != null;
    }
    getFrameworkComponentInstance() {
        return this.instance;
    }
    callMethod(name, args) {
        return this.instance[name].apply(this.instance, args);
    }
    addMethod(name, callback) {
        this[name] = callback;
    }
}
