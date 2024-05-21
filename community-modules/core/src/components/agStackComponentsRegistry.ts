import { Bean } from '../context/context';
import { _warnOnce } from '../utils/function';
import { AgComponentSelector, ComponentClass } from '../widgets/component';

@Bean('agStackComponentsRegistry')
export class AgStackComponentsRegistry {
    private componentToNodeName: Map<string, ComponentClass> = new Map();

    public ensureRegistered(comps: ComponentClass[]): void {
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            if (this.componentToNodeName.has(comp.selector)) {
                continue;
            }
            // each component must have a unique selector
            // Uppercase as we use the nodeName from the Element https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
            let name = comp.selector.toUpperCase();
            this.componentToNodeName.set(name, comp);
        }
    }

    public getComponent(name: Uppercase<AgComponentSelector>, optional: boolean = false): ComponentClass | undefined {
        const comp = this.componentToNodeName.get(name);
        if (!comp && !optional && name.startsWith('AG-')) {
            _warnOnce(`(${name}) missing!`);
        }
        return comp;
    }
}
