import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { OverlayService } from '../../rendering/overlays/overlayService';
import type { CapturedDiagnostic, SeverityThreshold } from '../logging';
import { _addDiagnosticListener, _diagnosticKey, _meetsSeverityThreshold } from '../logging';
import { _getDevOverlayMode } from '../validationConfig';

type UpdateListener = () => void;

/**
 * Dev-only bean (ValidationModule) that collects captured diagnostics for this grid and drives the
 * core OverlayService to show the validation error overlay. The overlay component reads the
 * accumulated diagnostics back from here and re-renders in place when they change.
 */
export class ErrorOverlayService extends BeanStub implements NamedBean {
    beanName = 'errorOverlay' as const;

    private overlays?: OverlayService;
    private overlayMode: SeverityThreshold = 'none';

    private readonly diagnostics: CapturedDiagnostic[] = [];
    private readonly seenKeys = new Set<string>();
    private readonly updateListeners = new Set<UpdateListener>();
    private keySeed = 0;

    public wireBeans(beans: BeanCollection): void {
        this.overlays = beans.overlays;
    }

    public postConstruct(): void {
        const mode = _getDevOverlayMode();
        // 'none' means the developer opted out of the overlay; attach no listener so there is no work.
        if (mode === 'none') {
            return;
        }
        this.overlayMode = mode;
        this.addDestroyFunc(
            _addDiagnosticListener(this.beans.context.getId(), (diagnostic) => this.onDiagnostic(diagnostic))
        );
    }

    /** Diagnostics to display, in capture order. */
    public getDiagnostics(): readonly CapturedDiagnostic[] {
        return this.diagnostics;
    }

    /** Registers a listener called whenever the diagnostics change, for live overlay refresh. */
    public addUpdateListener(listener: UpdateListener): () => void {
        this.updateListeners.add(listener);
        return () => {
            this.updateListeners.delete(listener);
        };
    }

    /** Hides the overlay until a new distinct diagnostic arrives. The accumulated list is retained. */
    public dismiss(): void {
        this.overlays?.setDevErrorOverlay(false);
    }

    private onDiagnostic(diagnostic: CapturedDiagnostic): void {
        if (!_meetsSeverityThreshold(diagnostic.severity, this.overlayMode)) {
            return;
        }
        const key = this.getKey(diagnostic);
        if (this.seenKeys.has(key)) {
            return;
        }
        this.seenKeys.add(key);
        this.diagnostics.push(diagnostic);
        // A new distinct diagnostic re-surfaces a dismissed overlay; duplicates are deduped above, so
        // a dismissed overlay stays hidden until something genuinely new arrives.
        this.overlays?.setDevErrorOverlay(true);
        for (const listener of this.updateListeners) {
            listener();
        }
    }

    /** Stable dedup key; tolerates non-serialisable params (functions, circular refs). */
    private getKey(diagnostic: CapturedDiagnostic): string {
        return _diagnosticKey(diagnostic, this.keySeed++);
    }
}
