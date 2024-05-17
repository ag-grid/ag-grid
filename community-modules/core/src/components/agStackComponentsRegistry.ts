import { Bean } from '../context/context';
import { _getFunctionName, _warnOnce } from '../utils/function';
import { ComponentClass } from '../widgets/component';

@Bean('agStackComponentsRegistry')
export class AgStackComponentsRegistry {
    private componentToNodeName: Map<string, ComponentClass> = new Map();
    private components: Set<ComponentClass> = new Set();

    public ensureRegistered(comps: ComponentClass[]): void {
        for (let i = 0; i < comps.length; i++) {
            const comp = comps[i];
            if (this.components.has(comp)) {
                continue;
            }

            // get name of the class as a string
            // insert a dash after every capital letter
            // remove leading underscore if present due to static properties
            let name = _getFunctionName(comp);
            name = name!.replace(/([a-z])([A-Z])/g, '$1-$2').replace('_','').toUpperCase();
            this.componentToNodeName.set(name, comp);
            this.components.add(comp);
        }
    }

    public getComponentForNode(name: AgComponentElementName, optional: boolean = false): ComponentClass | undefined{
        const compClass = this.componentToNodeName.get(name);
        if(!compClass && !optional) {
            _warnOnce(`${name} is not registered and is required`);
        }
        return compClass;
    }

}

export type AgComponentElementName =
    | 'AG-FLOATING-TOP'
    | 'AG-FLOATING-BOTTOM'
    | 'AG-STICKY-TOP'
    | 'AG-STICKY-BOTTOM'
    | 'AG-BODY-HORIZONTAL-SCROLL'
    | 'AG-BODY-VERTICAL-SCROLL'
    | 'AG-OVERLAY-WRAPPER'
    | 'AG-CHECKBOX'
    | 'AG-RADIO-BUTTON'
    | 'AG-TOGGLE-BUTTON'
    | 'AG-INPUT-TEXT-FIELD'
    | 'AG-INPUT-TEXT-AREA'
    | 'AG-INPUT-NUMBER-FIELD'
    | 'AG-INPUT-DATE-FIELD'
    | 'AG-INPUT-RANGE'
    | 'AG-RICH-SELECT'
    | 'AG-SELECT'
    | 'AG-SLIDER'
    | 'AG-GRID-BODY'
    | 'AG-HEADER-ROOT'
    | 'AG-SORT-INDICATOR'
    | 'AG-PAGINATION'
    | 'AG-PAGE-SIZE-SELECTOR'
    | 'AG-OVERLAY-WRAPPER'
    | 'AG-GROUP-COMPONENT'
    | 'AG-ROW-CONTAINER'
    | 'AG-FAKE-HORIZONTAL-SCROLL'
    | 'AG-FAKE-VERTICAL-SCROLL'
    | 'AG-AUTOCOMPLETE'
    | 'AG-ADVANCED-FILTER'
    | 'AG-WATERMARK'
    | 'AG-SIDE-BAR'
    | 'AG-STATUS-BAR'
    | 'AG-GRID-HEADER-DROP-ZONES'
    | 'AG-PAGINATION';
