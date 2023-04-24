import { PostConstruct, Autowired } from '../context/context';
import { FocusService } from '../focusService';
import { KeyCode } from '../constants/keyCode';
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from '../utils/event';
import { BeanStub } from '../context/beanStub';

export interface ManagedFocusCallbacks {
    shouldStopEventPropagation?: (e: KeyboardEvent) => boolean;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    onFocusIn?: (e: FocusEvent) => void;
    onFocusOut?: (e: FocusEvent) => void;
}

export class ManagedFocusFeature extends BeanStub {

    public static FOCUS_MANAGED_CLASS = 'ag-focus-managed';

    @Autowired('focusService') private readonly focusService: FocusService;

    constructor(
        private readonly eFocusableElement: HTMLElement,
        private callbacks: ManagedFocusCallbacks = {}
    ) {
        super();
        this.callbacks = {
            shouldStopEventPropagation: () => false,
            onTabKeyDown: (e: KeyboardEvent) => {
                if (e.defaultPrevented) { return; }

                const nextRoot = this.focusService.findNextFocusableElement(this.eFocusableElement, false, e.shiftKey);

                if (!nextRoot) { return; }

                nextRoot.focus();
                e.preventDefault();
            },
            ...callbacks
        };
    }

    @PostConstruct
    protected postConstruct(): void {
        this.eFocusableElement.classList.add(ManagedFocusFeature.FOCUS_MANAGED_CLASS);

        this.addKeyDownListeners(this.eFocusableElement);

        if (this.callbacks.onFocusIn) {
            this.addManagedListener(this.eFocusableElement, 'focusin', this.callbacks.onFocusIn);
        }

        if (this.callbacks.onFocusOut) {
            this.addManagedListener(this.eFocusableElement, 'focusout', this.callbacks.onFocusOut);
        }
    }

    private addKeyDownListeners(eGui: HTMLElement): void {
        this.addManagedListener(eGui, 'keydown', (e: KeyboardEvent) => {
            if (e.defaultPrevented || isStopPropagationForAgGrid(e)) { return; }

            if (this.callbacks.shouldStopEventPropagation!(e)) {
                stopPropagationForAgGrid(e);
                return;
            }

            if (e.key === KeyCode.TAB) {
                this.callbacks.onTabKeyDown!(e);
            } else if (this.callbacks.handleKeyDown) {
                this.callbacks.handleKeyDown(e);
            }
        });
    }
}
