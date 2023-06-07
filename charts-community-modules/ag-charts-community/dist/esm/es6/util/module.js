export class BaseModuleInstance {
    constructor() {
        this.destroyFns = [];
    }
    destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }
}
export const REGISTERED_MODULES = [];
export function registerModule(module) {
    const otherModule = REGISTERED_MODULES.find((other) => {
        return (module.type === other.type &&
            module.optionsKey === other.optionsKey &&
            module.identifier === other.identifier);
    });
    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            const index = REGISTERED_MODULES.indexOf(otherModule);
            REGISTERED_MODULES.splice(index, 1, module);
        }
        else {
            // Skip if the module is already registered
        }
    }
    else {
        // Simply register the module
        REGISTERED_MODULES.push(module);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTBHQSxNQUFNLE9BQWdCLGtCQUFrQjtJQUF4QztRQUN1QixlQUFVLEdBQW1CLEVBQUUsQ0FBQztJQU92RCxDQUFDO0lBTEcsT0FBTztRQUNILEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNyQyxTQUFTLEVBQUUsQ0FBQztTQUNmO0lBQ0wsQ0FBQztDQUNKO0FBRUQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQWEsRUFBRSxDQUFDO0FBQy9DLE1BQU0sVUFBVSxjQUFjLENBQUMsTUFBYztJQUN6QyxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNsRCxPQUFPLENBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSTtZQUMxQixNQUFNLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVO1lBQ3RDLE1BQU0sQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FDekMsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxXQUFXLEVBQUU7UUFDYixJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssWUFBWSxJQUFJLFdBQVcsQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFO1lBQ2hGLDBEQUEwRDtZQUMxRCxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEQsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDL0M7YUFBTTtZQUNILDJDQUEyQztTQUM5QztLQUNKO1NBQU07UUFDSCw2QkFBNkI7UUFDN0Isa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ25DO0FBQ0wsQ0FBQyJ9