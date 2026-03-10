import { _ensureDomOrder } from '../agStack/utils/dom';
import { BeanStub } from '../context/beanStub';
import type { IPinnedSectionCompHost } from '../interfaces/iPinnedSectionCompHost';
import type { RowContainerName } from './rowContainer/rowContainerCtrl';

type PinnedSection = 'top' | 'bottom';
type PinnedSectionStream = 'center' | 'fullWidth';
type PinnedSectionLane = 'edge' | 'pinned' | 'sticky';

interface PinnedRowContainerRendererSourceConfig {
    id: string;
    section: PinnedSection;
    stream: PinnedSectionStream;
    lane: PinnedSectionLane;
    order?: number;
    lockToViewportX?: boolean;
    getTopOffsetPx?: () => number;
    placeAfterHeaderRows?: boolean;
}

export interface PinnedRowContainerRendererSource {
    setRows(rows: HTMLElement[]): void;
    setElements(elements: HTMLElement[]): void;
    clear(): void;
    destroy(): void;
}

type HostKey = `${PinnedSection}:${PinnedSectionStream}`;

interface SourceState extends PinnedRowContainerRendererSourceConfig {
    order: number;
    sequence: number;
    elements: HTMLElement[];
}

export interface IPinnedRowContainerRendererFeature {
    registerSource(config: PinnedRowContainerRendererSourceConfig): PinnedRowContainerRendererSource;
    registerRowContainerSource(name: RowContainerName): PinnedRowContainerRendererSource | undefined;
    createCompHost(config: Omit<PinnedRowContainerRendererSourceConfig, 'id'>): IPinnedSectionCompHost;
    refresh(): void;
    refreshViewportPinned(): void;
}

let nextCompHostId = 0;

export class PinnedRowContainerRendererFeature extends BeanStub implements IPinnedRowContainerRendererFeature {
    private readonly sources = new Map<string, SourceState>();
    private readonly managedByHost = new Map<HostKey, Set<HTMLElement>>();
    private readonly hosts: {
        topCenter: HTMLElement;
        topFullWidth: HTMLElement;
        bottomCenter: HTMLElement;
        bottomFullWidth: HTMLElement;
    };
    private readonly eGridViewport: HTMLElement;
    private sourceSequence = 0;
    private rowContainerSourceSequence = 0;

    constructor(
        topCenter: HTMLElement,
        topFullWidth: HTMLElement,
        bottomCenter: HTMLElement,
        bottomFullWidth: HTMLElement,
        eGridViewport: HTMLElement
    ) {
        super();
        this.hosts = {
            topCenter,
            topFullWidth,
            bottomCenter,
            bottomFullWidth,
        };
        this.eGridViewport = eGridViewport;
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
        this.refreshHost(state.section, state.stream);

        return {
            setRows: (rows) => this.setSourceElements(config.id, rows),
            setElements: (elements) => this.setSourceElements(config.id, elements),
            clear: () => this.setSourceElements(config.id, []),
            destroy: () => this.destroySource(config.id),
        };
    }

    public createCompHost(config: Omit<PinnedRowContainerRendererSourceConfig, 'id'>): IPinnedSectionCompHost {
        const sourceId = `pinned-row-container-comp-${nextCompHostId++}`;
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
                    stream: 'center',
                    lane: 'pinned',
                });
            case 'pinnedTopFullWidth':
                return this.registerSource({
                    id,
                    section: 'top',
                    stream: 'fullWidth',
                    lane: 'pinned',
                });
            case 'pinnedBottomCenter':
                return this.registerSource({
                    id,
                    section: 'bottom',
                    stream: 'center',
                    lane: 'sticky',
                });
            case 'pinnedBottomFullWidth':
                return this.registerSource({
                    id,
                    section: 'bottom',
                    stream: 'fullWidth',
                    lane: 'sticky',
                });
            default:
                return;
        }
    }

    public refresh(): void {
        this.refreshHost('top', 'center');
        this.refreshHost('top', 'fullWidth');
        this.refreshHost('bottom', 'center');
        this.refreshHost('bottom', 'fullWidth');
    }

    public refreshViewportPinned(): void {
        const visited = new Set<HostKey>();
        for (const source of this.sources.values()) {
            if (source.lockToViewportX) {
                const key = this.toHostKey(source.section, source.stream);
                if (!visited.has(key)) {
                    visited.add(key);
                    this.refreshHost(source.section, source.stream);
                }
            }
        }
    }

    private setSourceElements(id: string, elements: HTMLElement[]): void {
        const source = this.sources.get(id);
        if (!source) {
            return;
        }
        source.elements = elements;
        this.refreshHost(source.section, source.stream);
    }

    private destroySource(id: string): void {
        const source = this.sources.get(id);
        if (!source) {
            return;
        }
        this.sources.delete(id);
        this.refreshHost(source.section, source.stream);
    }

    private refreshHost(section: PinnedSection, stream: PinnedSectionStream): void {
        const host = this.getHost(section, stream);
        const hostKey = this.toHostKey(section, stream);
        const sortedSources = this.getSortedSources(section, stream);
        const orderedEntries: { eGui: HTMLElement; source: SourceState }[] = [];
        const activeElements = new Set<HTMLElement>();

        for (const source of sortedSources) {
            for (const eGui of source.elements) {
                if (activeElements.has(eGui)) {
                    continue;
                }
                activeElements.add(eGui);
                orderedEntries.push({ eGui, source });
                if (source.lockToViewportX) {
                    this.applyViewportPinnedLayout(source, eGui);
                }
            }
        }

        const previousElements = this.managedByHost.get(hostKey);
        if (previousElements) {
            for (const eGui of previousElements) {
                if (!activeElements.has(eGui) && eGui.parentElement === host) {
                    eGui.remove();
                }
            }
        }

        this.managedByHost.set(hostKey, activeElements);

        let previous: HTMLElement | null = null;
        for (const { eGui, source } of orderedEntries) {
            if (source.placeAfterHeaderRows) {
                this.placeAfterHeaderRows(host, eGui);
            } else {
                if (eGui.parentElement !== host) {
                    host.appendChild(eGui);
                }
                _ensureDomOrder(host, eGui, previous);
            }
            previous = eGui;
        }
    }

    private getSortedSources(section: PinnedSection, stream: PinnedSectionStream): SourceState[] {
        const laneOrder = section === 'top' ? TOP_LANE_ORDER : BOTTOM_LANE_ORDER;
        return Array.from(this.sources.values())
            .filter((source) => source.section === section && source.stream === stream)
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

    private placeAfterHeaderRows(host: HTMLElement, eGui: HTMLElement): void {
        const firstNonHeaderRow = Array.from(host.children).find((child) => {
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

        const headerRows = Array.from(host.children).filter((child) => {
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

        host.appendChild(eGui);
    }

    private applyViewportPinnedLayout(source: SourceState, eGui: HTMLElement): void {
        const viewportWidth = this.eGridViewport.getBoundingClientRect().width;
        const contentWidth =
            this.beans.ctrlsSvc.getGridBodyCtrl()?.getHorizontalContentWidth() ?? this.eGridViewport.scrollWidth;
        const maxScrollLeft = Math.max(0, contentWidth - viewportWidth);
        const scrollLeft = Math.min(Math.abs(this.eGridViewport.scrollLeft), maxScrollLeft);

        eGui.style.position = 'absolute';
        eGui.style.width = `${viewportWidth}px`;
        if (source.getTopOffsetPx) {
            eGui.style.top = `${source.getTopOffsetPx()}px`;
        }

        if (this.gos.get('enableRtl')) {
            eGui.style.right = '0px';
            eGui.style.removeProperty('left');
            eGui.style.transform = `translateX(${-scrollLeft}px)`;
        } else {
            eGui.style.left = '0px';
            eGui.style.removeProperty('right');
            eGui.style.transform = `translateX(${scrollLeft}px)`;
        }
    }

    private getHost(section: PinnedSection, stream: PinnedSectionStream): HTMLElement {
        if (section === 'top') {
            return stream === 'center' ? this.hosts.topCenter : this.hosts.topFullWidth;
        }
        return stream === 'center' ? this.hosts.bottomCenter : this.hosts.bottomFullWidth;
    }

    private toHostKey(section: PinnedSection, stream: PinnedSectionStream): HostKey {
        return `${section}:${stream}`;
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
