import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import { _createCellId } from '../../entities/positionUtils';
import type { FlashCellsEvent } from '../../events';
import type { FlashCellsParams } from '../../interfaces/iCellsParams';
import type { CellCtrl } from './cellCtrl';

type FlashClassName = 'highlight' | 'data-changed';
interface AnimationPhase {
    phase: 'flash' | 'fade';
    flashEndTime: number;
    fadeEndTime: number;
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
        const animations = this.animations[cssName];
        // cancel any pre-existing animation for this cell
        animations.delete(cellCtrl);

        const time = Date.now();
        const flashEndTime = time + flashDuration;
        const fadeEndTime = time + flashDuration + fadeDuration;

        const animState = {
            phase: 'flash' as const,
            flashEndTime,
            fadeEndTime,
        };
        animations.set(cellCtrl, animState);

        const cssBase = `ag-cell-${cssName}`;
        const cssAnimation = `${cssBase}-animation`;

        const {
            comp,
            eGui: { style },
        } = cellCtrl;
        // we want to highlight the cells, without any animation
        comp.toggleCss(cssBase, true);
        comp.toggleCss(cssAnimation, false);
        style.removeProperty('transition');
        style.removeProperty('transition-delay');

        // need an earlier animation cycle, but we delay flash end by 15ms as it's ok if fade starts a little late
        // in favour of batching
        if (this.nextAnimationTime && flashEndTime + 15 < this.nextAnimationTime) {
            clearTimeout(this.nextAnimationCycle!);
            this.nextAnimationCycle = null;
            this.nextAnimationTime = null;
        }

        if (!this.nextAnimationCycle) {
            // then once that is applied, we remove the highlight with animation
            this.beans.frameworkOverrides.wrapIncoming(() => {
                this.nextAnimationCycle = setTimeout(this.advanceAnimations.bind(this), flashDuration);
            });
            this.nextAnimationTime = flashEndTime;
        }
    }

    private advanceAnimations() {
        const time = Date.now();
        let nextAnimationTime: number | null = null;
        for (const cssName of Object.keys(this.animations) as FlashClassName[]) {
            const animations = this.animations[cssName];
            const cssBase = `ag-cell-${cssName}`;
            const cssAnimation = `${cssBase}-animation`;

            for (const [cell, animState] of animations) {
                if (!cell.isAlive() || !cell.comp) {
                    animations.delete(cell);
                    continue;
                }
                const { phase, flashEndTime, fadeEndTime } = animState;

                const nextActionableTime = phase === 'flash' ? flashEndTime : fadeEndTime;
                const requiresAction = time + 15 >= nextActionableTime; // if need to act up to 15ms in future, batch into now.
                if (!requiresAction) {
                    nextAnimationTime = Math.min(nextActionableTime, nextAnimationTime ?? Infinity);
                    continue;
                }

                const {
                    comp,
                    eGui: { style },
                } = cell;
                switch (phase) {
                    case 'flash':
                        comp.toggleCss(cssBase, false);
                        comp.toggleCss(cssAnimation, true);
                        style.transition = `background-color ${fadeEndTime - flashEndTime}ms`;
                        // transition delay accounts for the fact that the timeout may be late
                        // and allows the animation to delay or start part way through
                        style.transitionDelay = `${flashEndTime - time}ms`;
                        nextAnimationTime = Math.min(fadeEndTime, nextAnimationTime ?? Infinity);
                        animState.phase = 'fade';
                        break;
                    case 'fade':
                        comp.toggleCss(cssBase, false);
                        comp.toggleCss(cssAnimation, false);
                        style.removeProperty('transition');
                        style.removeProperty('transition-delay');
                        animations.delete(cell);
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

    public override destroy(): void {
        for (const cssName of Object.keys(this.animations) as Array<FlashClassName>) {
            const animations = this.animations[cssName];
            animations.clear();
        }
    }
}
