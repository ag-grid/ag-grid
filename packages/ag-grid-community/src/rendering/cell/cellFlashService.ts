import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import { _createCellId } from '../../entities/positionUtils';
import type { FlashCellsEvent } from '../../events';
import type { FlashCellsParams } from '../../interfaces/iCellsParams';
import type { CellCtrl } from './cellCtrl';

export class CellFlashService extends BeanStub implements NamedBean {
    beanName = 'cellFlashSvc' as const;

    private nextAnimationTime: number | null = null;
    private nextAnimationCycle: number | null = null;

    private runningAnimations: {
        cell: WeakRef<CellCtrl>;
        anim: 'highlight' | 'data-changed';
        phase: 'flash' | 'fade' | 'done';
        flashEnd: number;
        fadeEnd: number;
    }[] = [];

    private animateCell(
        cellCtrl: CellCtrl,
        cssName: 'highlight' | 'data-changed',
        flashDuration: number = this.beans.gos.get('cellFlashDuration'),
        fadeDuration: number = this.beans.gos.get('cellFadeDuration')
    ) {
        // cancel any pre-existing animation for this cell
        this.runningAnimations = this.runningAnimations.filter(
            ({ cell, anim }) => anim !== cssName && cell.deref() !== cellCtrl
        );

        const animState = {
            cell: new WeakRef(cellCtrl),
            anim: cssName,
            phase: 'flash' as const,
            flashEnd: Date.now() + flashDuration,
            fadeEnd: Date.now() + flashDuration + fadeDuration,
        };
        this.runningAnimations.push(animState);

        const fullName = `ag-cell-${cssName}`;
        const animationFullName = `ag-cell-${cssName}-animation`;

        const cellComp = cellCtrl.comp;
        // we want to highlight the cells, without any animation
        cellCtrl.eGui.style.transition = '';
        cellCtrl.eGui.style.transitionDelay = '';
        cellComp.toggleCss(fullName, true);
        cellComp.toggleCss(animationFullName, false);

        // need an earlier animation cycle, but we delay flash end by 10ms as it's ok if fade starts a little late
        // in favour of batching
        if (this.nextAnimationTime && animState.flashEnd + 15 < this.nextAnimationTime) {
            clearTimeout(this.nextAnimationCycle!);
            this.nextAnimationCycle = null;
            this.nextAnimationTime = null;
        }

        if (!this.nextAnimationCycle) {
            this.nextAnimationCycle = setTimeout(this.advanceAnimations.bind(this), flashDuration);
            this.nextAnimationTime = Date.now() + flashDuration;
        }
    }

    private advanceAnimations() {
        let filterAfterFinish = false;
        let nextAnimationTime: number | null = null;
        const time = Date.now();
        for (const animState of this.runningAnimations) {
            const nextActionableTime = animState.phase === 'flash' ? animState.flashEnd : animState.fadeEnd;
            const requiresAction = time + 15 >= nextActionableTime;
            if (!requiresAction) {
                nextAnimationTime = Math.min(nextActionableTime, nextAnimationTime ?? Infinity);
                continue;
            }

            const cell = animState.cell.deref();
            if (!cell?.isAlive() || !cell.comp) {
                animState.phase = 'done';
                filterAfterFinish = true;
                continue;
            }

            const cellComp = cell.comp;
            const fullName = `ag-cell-${animState.anim}`;
            const animationFullName = `ag-cell-${animState.anim}-animation`;

            const { phase, flashEnd, fadeEnd } = animState;
            switch (phase) {
                case 'flash':
                    cellComp.toggleCss(fullName, false);
                    cellComp.toggleCss(animationFullName, true);
                    cell.eGui.style.transition = `background-color ${fadeEnd - flashEnd}ms`;
                    cell.eGui.style.transitionDelay = `${flashEnd - time}ms`; // start part way through the fade
                    nextAnimationTime = Math.min(flashEnd, nextAnimationTime ?? Infinity);
                    animState.phase = 'fade';
                    break;
                case 'fade':
                    cellComp.toggleCss(fullName, false);
                    cellComp.toggleCss(animationFullName, false);
                    cell.eGui.style.transition = '';
                    cell.eGui.style.transitionDelay = '';
                    animState.phase = 'done';
                    filterAfterFinish = true;
                    break;
            }
        }

        if (filterAfterFinish) {
            this.runningAnimations = this.runningAnimations.filter((animState) => animState.phase !== 'done');
        }

        if (this.runningAnimations.length === 0) {
            this.nextAnimationCycle = null;
        } else if (nextAnimationTime) {
            this.nextAnimationCycle = setTimeout(this.advanceAnimations.bind(this), nextAnimationTime - time);
            this.nextAnimationTime = nextAnimationTime;
        }
    }

    public onFlashCells(cellCtrl: CellCtrl, event: FlashCellsEvent): void {
        if (!cellCtrl.comp) {
            return;
        }
        const cellId = _createCellId(cellCtrl.cellPosition);
        const shouldFlash = event.cells[cellId];
        if (shouldFlash) {
            this.animateCell(cellCtrl, 'highlight');
        }
    }

    public flashCell(cellCtrl: CellCtrl, delays?: Pick<FlashCellsParams, 'fadeDuration' | 'flashDuration'>): void {
        this.animateCell(cellCtrl, 'data-changed', delays?.flashDuration, delays?.fadeDuration);
    }
}
