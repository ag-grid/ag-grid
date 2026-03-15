import { _ensureDomOrder } from '../agStack/utils/dom';
import { BeanStub } from '../context/beanStub';
import type { IPinnedSectionCompHost } from '../interfaces/iPinnedSectionCompHost';
import type { RowContainerName } from './rowContainer/rowContainerCtrl';

type PinnedSection = 'top' | 'bottom';
type PinnedSectionLane = 'edge' | 'pinned' | 'sticky';

interface PinnedRowContainerRendererSourceConfig {
    id: string;
    section: PinnedSection;
    lane: PinnedSectionLane;
    order?: number;
    getTopOffsetPx?: () => number;
    placeAfterHeaderRows?: boolean;
    wrapper?: HTMLElement;
}

export interface PinnedRowContainerRendererSource {
    setRows(rows: HTMLElement[]): void;
    setElements(elements: HTMLElement[]): void;
    clear(): void;
    destroy(): void;
}

interface SourceState extends PinnedRowContainerRendererSourceConfig {
    order: number;
    sequence: number;
    elements: HTMLElement[];
}

export interface IPinnedRowContainerRendererFeature {
    registerSource(config: PinnedRowContainerRendererSourceConfig): PinnedRowContainerRendererSource;
    registerRowContainerSource(name: RowContainerName): PinnedRowContainerRendererSource | undefined;
    createCompSide(config: Omit<PinnedRowContainerRendererSourceConfig, 'id'>): IPinnedSectionCompHost;
    refresh(): void;
}

let nextCompSideId = 0;

export class PinnedRowContainerRendererFeature extends BeanStub implements IPinnedRowContainerRendererFeature {
    private readonly sources = new Map<string, SourceState>();
    private readonly managedBySide = new Map<PinnedSection, Set<HTMLElement>>();
    private readonly sides: {
        top: HTMLElement;
        bottom: HTMLElement;
    };
    private sourceSequence = 0;
    private rowContainerSourceSequence = 0;

    constructor(topCenter: HTMLElement, bottomCenter: HTMLElement) {
        super();
        this.sides = {
            top: topCenter,
            bottom: bottomCenter,
        };
    }

    public registerSource(config: PinnedRowContainerRendererSourceConfig): PinnedRowContainerRendererSource {
        if (this.sources.has(config.id)) {
            throw new Error(`PinnedRowContainerRendererFeature source already exists: ${config.id}`);
        }

        const state: SourceState = {
            ...config,
            order: config.order ?? 0,
            sequence: this.sourceSequence++,
            elements: [],
        };
        this.sources.set(config.id, state);
        this.refreshSide(state.section);

        return {
            setRows: (rows) => this.setSourceElements(config.id, rows),
            setElements: (elements) => this.setSourceElements(config.id, elements),
            clear: () => this.setSourceElements(config.id, []),
            destroy: () => this.destroySource(config.id),
        };
    }

    public createCompSide(config: Omit<PinnedRowContainerRendererSourceConfig, 'id'>): IPinnedSectionCompHost {
        const sourceId = `pinned-row-container-comp-${nextCompSideId++}`;
        const source = this.registerSource({
            ...config,
            id: sourceId,
        });
        const comps = new Set<HTMLElement>();

        return {
            mountComp: (eGui) => {
                comps.add(eGui);
                source.setElements(Array.from(comps));
            },
            unmountComp: (eGui) => {
                comps.delete(eGui);
                source.setElements(Array.from(comps));
            },
        };
    }

    public registerRowContainerSource(name: RowContainerName): PinnedRowContainerRendererSource | undefined {
        const id = `row-container-${name}-${this.rowContainerSourceSequence++}`;

        switch (name) {
            case 'pinnedTopCenter':
                return this.registerSource({
                    id,
                    section: 'top',
                    lane: 'pinned',
                });
            case 'pinnedBottomCenter':
                return this.registerSource({
                    id,
                    section: 'bottom',
                    lane: 'sticky',
                });
            default:
                return;
        }
    }

    public refresh(): void {
        this.refreshSide('top');
        this.refreshSide('bottom');
    }

    private setSourceElements(id: string, elements: HTMLElement[]): void {
        const source = this.sources.get(id);
        if (!source) {
            return;
        }
        source.elements = elements;
        this.refreshSide(source.section);
    }

    private destroySource(id: string): void {
        const source = this.sources.get(id);
        if (!source) {
            return;
        }
        this.sources.delete(id);
        this.refreshSide(source.section);
    }

    private refreshSide(section: PinnedSection): void {
        const side = this.sides[section];
        const sortedSources = this.getSortedSources(section);

        // collect active elements and ensure wrappers are in the DOM
        const activeElements = new Set<HTMLElement>();
        const wrapperElements = new Set<HTMLElement>();
        const orderedEntries: { eGui: HTMLElement; source: SourceState }[] = [];

        for (const source of sortedSources) {
            if (source.wrapper) {
                wrapperElements.add(source.wrapper);
                if (source.wrapper.parentElement !== side) {
                    side.appendChild(source.wrapper);
                }
            }
            for (const eGui of source.elements) {
                if (activeElements.has(eGui)) {
                    continue;
                }
                activeElements.add(eGui);
                orderedEntries.push({ eGui, source });
                if (source.getTopOffsetPx) {
                    eGui.style.position = 'absolute';
                    eGui.style.top = `${source.getTopOffsetPx()}px`;
                }
            }
        }

        // remove stale elements (but not wrappers — they're managed separately)
        const previousElements = this.managedBySide.get(section);
        if (previousElements) {
            for (const eGui of previousElements) {
                if (!activeElements.has(eGui) && !wrapperElements.has(eGui) && side.contains(eGui)) {
                    eGui.remove();
                }
            }
        }
        this.managedBySide.set(section, activeElements);

        // place elements in their containers with correct ordering
        let previous: HTMLElement | null = null;
        let previousContainer: HTMLElement | null = null;
        for (const { eGui, source } of orderedEntries) {
            if (source.placeAfterHeaderRows) {
                this.placeAfterHeaderRows(side, eGui);
            } else {
                const container = source.wrapper ?? side;
                if (container !== previousContainer) {
                    previous = null;
                    previousContainer = container;
                }
                if (eGui.parentElement !== container) {
                    container.appendChild(eGui);
                }
                _ensureDomOrder(container, eGui, previous);
            }
            previous = eGui;
        }
    }

    private getSortedSources(section: PinnedSection): SourceState[] {
        const laneOrder = section === 'top' ? TOP_LANE_ORDER : BOTTOM_LANE_ORDER;
        return Array.from(this.sources.values())
            .filter((source) => source.section === section)
            .sort((a, b) => {
                const laneDiff = laneOrder[a.lane] - laneOrder[b.lane];
                if (laneDiff !== 0) {
                    return laneDiff;
                }
                const orderDiff = a.order - b.order;
                if (orderDiff !== 0) {
                    return orderDiff;
                }
                return a.sequence - b.sequence;
            });
    }

    private placeAfterHeaderRows(side: HTMLElement, eGui: HTMLElement): void {
        const firstNonHeaderRow = Array.from(side.children).find((child) => {
            if (child === eGui) {
                return false;
            }
            const eChild = child as HTMLElement;
            return eChild.classList.contains('ag-row') && !eChild.classList.contains('ag-header-row');
        }) as HTMLElement | undefined;

        if (firstNonHeaderRow) {
            firstNonHeaderRow.before(eGui);
            return;
        }

        const headerRows = Array.from(side.children).filter((child) => {
            if (child === eGui) {
                return false;
            }
            return (child as HTMLElement).classList.contains('ag-header-row');
        }) as HTMLElement[];
        const lastHeaderRow = headerRows[headerRows.length - 1];
        if (lastHeaderRow) {
            lastHeaderRow.after(eGui);
            return;
        }

        side.appendChild(eGui);
    }
}

const TOP_LANE_ORDER: Record<PinnedSectionLane, number> = {
    edge: 0,
    pinned: 1,
    sticky: 2,
};

const BOTTOM_LANE_ORDER: Record<PinnedSectionLane, number> = {
    sticky: 0,
    pinned: 1,
    edge: 2,
};
