import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { CapturedDiagnostic } from './logging';
import { _addDiagnosticListener, _getDiagnosticMessage } from './logging';

/**
 * Dev-only bean (ValidationModule) that turns captured diagnostics into the public `diagnosticRaised`
 * event, so tooling can react to them programmatically. Every captured diagnostic is dispatched: unlike
 * the overlay this surface is not filtered by severity, as a consumer gets the severity in the payload
 * and decides for itself.
 */
export class DiagnosticEventService extends BeanStub implements NamedBean {
    beanName = 'diagnosticEvents' as const;

    /**
     * A consumer's handler may itself raise a diagnostic (calling a deprecated API, say), which would
     * re-enter here and recurse without bound. Diagnostics raised while dispatching are dropped.
     */
    private dispatching = false;

    public postConstruct(): void {
        this.addDestroyFunc(
            _addDiagnosticListener(this.beans.context.getId(), (diagnostic) => this.onDiagnostic(diagnostic))
        );
    }

    private onDiagnostic(diagnostic: CapturedDiagnostic): void {
        if (this.dispatching) {
            return;
        }
        this.dispatching = true;
        try {
            this.eventSvc.dispatchEvent({
                type: 'diagnosticRaised',
                id: diagnostic.id,
                severity: diagnostic.severity,
                message: _getDiagnosticMessage(diagnostic),
                attributedToThisGrid: diagnostic.gridId !== undefined,
            });
        } catch (e) {
            // A handler that throws must not break the code path that raised the diagnostic, nor stop the
            // remaining diagnostic listeners (the overlay shares this listener set).
            this.beans.log.error(330, { error: e });
        } finally {
            this.dispatching = false;
        }
    }
}
