class PolymerFrameworkComponentWrapper {
    // Polymer.Element, mandatoryMethodList: string[], optionalMethodList: string[]
    wrap(element, mandatoryMethodList, optionalMethodList) {
        function addMethod(wrapper, methodName, mandatory) {
            let methodProxy = function () {
                if (wrapper.getFrameworkComponentInstance()[methodName]) {
                    var componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments)
                } else {
                    if (mandatory) {
                        console.warn('ag-Grid: Polymer Element is missing the method ' + methodName + '()');
                    }
                    return null;
                }
            };

            wrapper[methodName] = methodProxy
        }

        let wrapper = new BaseGuiComponent(element);
        mandatoryMethodList.forEach((methodName => {
            addMethod(wrapper, methodName, true);
        }));

        if (optionalMethodList) {
            optionalMethodList.forEach((methodName => {
                addMethod(wrapper, methodName, false);
            }));
        }

        return wrapper;
    }
}
