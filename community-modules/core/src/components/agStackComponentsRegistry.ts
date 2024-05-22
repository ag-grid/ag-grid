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
            this.componentToNodeName.set(comp.selector, comp);
        }
    }

    public getComponent(name: AgComponentSelector, optional: boolean = false): ComponentClass | undefined {
        const comp = this.componentToNodeName.get(name);
        if (!comp && !optional && name.startsWith('AG-')) {
            _warnOnce(`(${name}) missing!`);
        }
        return comp;
    }
}
