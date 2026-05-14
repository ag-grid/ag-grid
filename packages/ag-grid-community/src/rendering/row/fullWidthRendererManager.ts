import type { BeanCollection } from '../../context/context';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { HorizontalSection, HorizontalSectionMap } from '../../interfaces/iGridSection';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _createElement } from '../../utils/element';
import type { ICellRendererComp, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { RowCtrl } from './rowCtrl';

const LEAF_RENDERER_TAGS = ['CANVAS', 'IMG', 'SVG', 'VIDEO', 'AUDIO', 'INPUT', 'IFRAME', 'PICTURE'];

export class FullWidthRendererManager {
    private renderer: ICellRendererComp | null | undefined;
    private rendererParams: ICellRendererParams | undefined;
    private renderersBySection: Partial<HorizontalSectionMap<ICellRendererComp | null>> = {};
    private rendererParamsBySection: Partial<HorizontalSectionMap<ICellRendererParams>> = {};

    private readonly destroyFuncs: (() => void)[] = [];

    constructor(
        private readonly beans: BeanCollection,
        private readonly rowCtrl: RowCtrl
    ) {}

    public show(compDetails: UserCompDetails, eRow: HTMLElement, isAlive: () => boolean): void {
        const eAnchor = _createElement({ tag: 'div', cls: 'ag-full-width-anchor', role: 'presentation' });
        eRow.appendChild(eAnchor);

        const callback = (cellRenderer: ICellRendererComp) => {
            if (isAlive()) {
                const eGui = cellRenderer.getGui();
                eAnchor.appendChild(eGui);
                this.rowCtrl.setupDetailRowAutoHeight(eGui);
                this.setRenderer(cellRenderer, compDetails.params);
            } else {
                this.beans.context.destroyBean(cellRenderer);
            }
        };

        compDetails.newAgStackInstance().then(callback);
    }

    public showEmbedded(
        compDetails: HorizontalSectionMap<UserCompDetails>,
        ePinnedLeftCells: HTMLElement | undefined,
        eScrollingCells: HTMLElement | undefined,
        ePinnedRightCells: HTMLElement | undefined,
        eRow: HTMLElement,
        isAlive: () => boolean
    ): void {
        this.showEmbeddedSection('left', compDetails.left, ePinnedLeftCells ?? eRow, isAlive);
        this.showEmbeddedSection('center', compDetails.center, eScrollingCells ?? eRow, isAlive);
        this.showEmbeddedSection('right', compDetails.right, ePinnedRightCells ?? eRow, isAlive);
    }

    private showEmbeddedSection(
        section: HorizontalSection,
        compDetails: UserCompDetails,
        host: HTMLElement,
        isAlive: () => boolean
    ): void {
        const callback = (cellRenderer: ICellRendererComp) => {
            if (!isAlive()) {
                this.beans.context.destroyBean(cellRenderer);
                return;
            }

            const eGui = cellRenderer.getGui();
            if (eGui) {
                host.replaceChildren(eGui);
            } else {
                host.replaceChildren();
            }
            // Check the host for actual visible content after appending. Framework wrappers
            // (Angular/Vue) return container elements from getGui() even when the component
            // renders nothing, so a simple null check on eGui is insufficient. Treat known
            // leaf renderers (canvas, img, svg, ...) as content unconditionally; for other
            // elements, require either child elements or non-empty text.
            const firstEl = host.firstElementChild;
            const hasContent =
                firstEl != null &&
                (firstEl.childElementCount > 0 ||
                    !!firstEl.textContent?.trim() ||
                    LEAF_RENDERER_TAGS.indexOf(firstEl.tagName) !== -1);
            this.rowCtrl.setEmbeddedSectionHasContent(section, hasContent);
            this.setEmbeddedRenderer(section, cellRenderer, compDetails.params);
            this.rowCtrl.refreshPinnedCellGroupWidths();
        };

        compDetails.newAgStackInstance().then(callback);
    }

    public refresh(getUpdatedParams: () => ICellRendererParams): boolean {
        const params = getUpdatedParams();
        this.rendererParams = params;
        return this.renderer?.refresh?.(params) ?? false;
    }

    public refreshEmbedded(getUpdatedParams: (pinned: ColumnPinnedType) => ICellRendererParams): boolean {
        let refreshed = true;
        const sections: [HorizontalSection, ColumnPinnedType][] = [
            ['left', 'left'],
            ['center', null],
            ['right', 'right'],
        ];

        for (const [section, pinned] of sections) {
            const params = getUpdatedParams(pinned);
            this.rendererParamsBySection[section] = params;

            const renderer = this.renderersBySection[section];
            if (renderer?.refresh && !renderer.refresh(params)) {
                refreshed = false;
            }
        }

        this.renderer = this.renderersBySection.center ?? null;
        this.rendererParams = this.rendererParamsBySection.center;
        return refreshed;
    }

    public getAllRenderers(): (ICellRendererComp | null | undefined)[] {
        if (this.rowCtrl.isEmbeddedFullWidth) {
            const { left, center, right } = this.renderersBySection;
            return [left, center, right].filter((r): r is ICellRendererComp => r != null);
        }
        return this.renderer ? [this.renderer] : [];
    }

    public getPrimaryParams(): ICellRendererParams | undefined {
        return this.rendererParams ?? this.rendererParamsBySection.center;
    }

    public getParamsForPinned(pinned: ColumnPinnedType): ICellRendererParams | undefined {
        return this.rendererParamsBySection[this.getSectionForPinned(pinned)];
    }

    public destroy(): void {
        for (const fn of this.destroyFuncs) {
            fn();
        }
        this.destroyFuncs.length = 0;
    }

    private getSectionForPinned(pinned: ColumnPinnedType): HorizontalSection {
        if (pinned === 'left') {
            return 'left';
        }
        if (pinned === 'right') {
            return 'right';
        }
        return 'center';
    }

    private setRenderer(renderer: ICellRendererComp, params: ICellRendererParams): void {
        this.renderer = renderer;
        this.rendererParams = params;
        this.destroyFuncs.push(() => {
            this.renderer = this.beans.context.destroyBean(this.renderer);
            this.rendererParams = undefined;
        });
    }

    private setEmbeddedRenderer(
        section: HorizontalSection,
        renderer: ICellRendererComp,
        params: ICellRendererParams
    ): void {
        this.renderersBySection[section] = renderer;
        this.rendererParamsBySection[section] = params;

        if (section === 'center') {
            this.renderer = renderer;
            this.rendererParams = params;
        }

        this.destroyFuncs.push(() => {
            this.renderersBySection[section] = this.beans.context.destroyBean(this.renderersBySection[section]);
            this.rendererParamsBySection[section] = undefined;
            if (section === 'center') {
                this.renderer = null;
                this.rendererParams = undefined;
            }
        });
    }
}
