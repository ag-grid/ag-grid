import {BindableProperty, HtmlBehaviorResource, metadata} from "aurelia-framework";

export function generateBindables(names: string[], bindingModeToUse?: any): any {
    return function (target: any, key: any, descriptor: any) {
        // get or create the HtmlBehaviorResource
        // on which we're going to create the BindableProperty's
        let behaviorResource: HtmlBehaviorResource = <HtmlBehaviorResource>metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);

        let nameOrConfigOrTargets: any[] = names.map((name) => {
            let nameOrConfigOrTarget:any = {
                name: name
            };

            if (bindingModeToUse) {
                nameOrConfigOrTarget["defaultBindingMode"] = bindingModeToUse;
            }

            return nameOrConfigOrTarget;
        });

        nameOrConfigOrTargets.forEach((nameOrConfigOrTarget) => {
            let prop = new BindableProperty(nameOrConfigOrTarget);
            prop.registerWith(target, behaviorResource, descriptor);
        });
    };
}