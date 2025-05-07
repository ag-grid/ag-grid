import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import { _createCellId } from '../../entities/positionUtils';
import type { FlashCellsEvent } from '../../events';
import type { FlashCellsParams } from '../../interfaces/iCellsParams';
import type { CellCtrl } from './cellCtrl';

type FlashClassName = 'highlight' | 'data-changed';
interface AnimationPhase {
    phase: 'flash' | 'fade';
    flashEnd: number;
    fadeEnd: number;
}
export class CellFlashService extends BeanStub implements NamedBean {
    beanName = 'cellFlashSvc' as const;

    private nextAnimationTime: number | null = null;
    private nextAnimationCycle: number | null = null;

    private animations: Record<FlashClassName, Map<CellCtrl, AnimationPhase>> = {
        highlight: new Map(),
        'data-changed': new Map(),
    };

    private animateCell(
        cellCtrl: CellCtrl,
        cssName: FlashClassName,
        flashDuration: number = this.beans.gos.get('cellFlashDuration'),
        fadeDuration: number = this.beans.gos.get('cellFadeDuration')
    ) {
        const time = Date.now();
        const animations = this.animations[cssName];
        // cancel any pre-existing animation for this cell
        animations.delete(cellCtrl);
        const animState = {
            phase: 'flash' as const,
            flashEnd: time + flashDuration,
            fadeEnd: time + flashDuration + fadeDuration,
        };
        animations.set(cellCtrl, animState);

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
            this.nextAnimationTime = time + flashDuration;
        }
    }

    private advanceAnimations() {
        const time = Date.now();
        let nextAnimationTime: number | null = null;
        for (const cssName of Object.keys(this.animations) as Array<FlashClassName>) {
            const animations = this.animations[cssName];

            for (const [cell, animState] of animations) {
                if (!cell.isAlive() || !cell.comp) {
                    animations.delete(cell);
                    continue;
                }

                const nextActionableTime = animState.phase === 'flash' ? animState.flashEnd : animState.fadeEnd;
                const requiresAction = time + 15 >= nextActionableTime; // if need to act up to 15ms in future, batch into now.
                if (!requiresAction) {
                    nextAnimationTime = Math.min(nextActionableTime, nextAnimationTime ?? Infinity);
                    continue;
                }

                const cellComp = cell.comp;
                const fullName = `ag-cell-${cssName}`;
                const animationFullName = `ag-cell-${cssName}-animation`;

                const { phase, flashEnd, fadeEnd } = animState;
                switch (phase) {
                    case 'flash':
                        cellComp.toggleCss(fullName, false);
                        cellComp.toggleCss(animationFullName, true);
                        cell.eGui.style.transition = `background-color ${fadeEnd - flashEnd}ms`;
                        cell.eGui.style.transitionDelay = `${flashEnd - time}ms`; // start part way through the fade
                        nextAnimationTime = Math.min(fadeEnd, nextAnimationTime ?? Infinity);
                        animState.phase = 'fade';
                        break;
                    case 'fade':
                        cellComp.toggleCss(fullName, false);
                        cellComp.toggleCss(animationFullName, false);
                        animations.delete(cell);
                        cell.eGui.style.transition = '';
                        cell.eGui.style.transitionDelay = '';
                        break;
                }
            }
        }

        if (nextAnimationTime == null) {
            this.nextAnimationTime = null;
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
