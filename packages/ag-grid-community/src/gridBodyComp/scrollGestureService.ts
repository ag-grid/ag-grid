import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridBodyCtrl } from './gridBodyCtrl';
import { ScrollGestureFeature } from './scrollGestureFeature';

export class ScrollGestureService extends BeanStub implements NamedBean {
    beanName = 'scrollGestureSvc' as const;

    private feature?: ScrollGestureFeature;

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, ({ gridBodyCtrl }) => {
            this.addManagedPropertyListener('scrollGestureMode', () => this.update(gridBodyCtrl));
            this.update(gridBodyCtrl);
        });
    }

    public isActive(): boolean {
        return this.feature != null;
    }

    private update(gridBodyCtrl: GridBodyCtrl): void {
        if (this.gos.get('scrollGestureMode') !== 'axisLocked') {
            this.feature = this.destroyBean(this.feature);
            return;
        }
        if (this.feature) {
            return;
        }
        const feature = this.createBean(new ScrollGestureFeature());
        feature.init(gridBodyCtrl.eGridBody, gridBodyCtrl.eGridViewport, gridBodyCtrl.scrollFeature);
        this.feature = feature;
    }

    public override destroy(): void {
        this.feature = this.destroyBean(this.feature);
        super.destroy();
    }
}
