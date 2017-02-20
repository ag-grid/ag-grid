// ag-grid-aurelia v8.1.0
"use strict";
var aurelia_framework_1 = require("aurelia-framework");
function generateBindables(names, bindingModeToUse) {
    return function (target, key, descriptor) {
        // get or create the HtmlBehaviorResource
        // on which we're going to create the BindableProperty's
        var behaviorResource = aurelia_framework_1.metadata.getOrCreateOwn(aurelia_framework_1.metadata.resource, aurelia_framework_1.HtmlBehaviorResource, target);
        var nameOrConfigOrTargets = names.map(function (name) {
            var nameOrConfigOrTarget = {
                name: name
            };
            if (bindingModeToUse) {
                nameOrConfigOrTarget["defaultBindingMode"] = bindingModeToUse;
            }
            return nameOrConfigOrTarget;
        });
        nameOrConfigOrTargets.forEach(function (nameOrConfigOrTarget) {
            var prop = new aurelia_framework_1.BindableProperty(nameOrConfigOrTarget);
            prop.registerWith(target, behaviorResource, descriptor);
        });
    };
}
exports.generateBindables = generateBindables;
