import { _ensureDomOrder } from '../agStack/utils/dom';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { IPinnedSectionCompHost } from '../interfaces/iPinnedSectionCompHost';

export type PinnedSection = 'top' | 'bottom';
export type PinnedSectionStream = 'center' | 'fullWidth';
export type PinnedSectionLane = 'edge' | 'pinned' | 'sticky';

export interface PinnedRowContainerRendererSourceConfig {
    id: string;
    section: PinnedSection;
    stream: PinnedSectionStream;
    lane: PinnedSectionLane;
    order?: number;
    pinToViewportX?: boolean;
    getViewportOffsetTop?: () => number;
    insertAfterHeadersBeforeRows?: boolean;
}

export interface PinnedRowContainerRendererSource {
    setRows(rows: HTMLElement[]): void;
    setElements(elements: HTMLElement[]): void;
    clear(): void;
    destroy(): void;
}

type HostKey = `${PinnedSection}:${PinnedSectionStream}`;

interface SourceState extends PinnedRowContainerRendererSourceConfig {
    sequence: number;
    elements: HTMLElement[];
}

export interface PinnedRowContainerRendererHosts {
    topCenter: HTMLElement;
    topFullWidth: HTMLElement;
    bottomCenter: HTMLElement;
    bottomFullWidth: HTMLElement;
}

let nextCompHostId = 0;

export class PinnedRowContainerRendererService extends BeanStub implements NamedBean {
    public beanName = 'pinnedRowContainerRenderer' as const;

    private readonly sources = new Map<string, SourceState>();
    private readonly managedByHost = new Map<HostKey, Set<HTMLElement>>();
    private sourceSequence = 0;
    private hosts?: PinnedRowContainerRendererHosts;
    private eGridViewport?: HTMLElement;

    public setComp(hosts: PinnedRowContainerRendererHosts, eGridViewport: HTMLElement): void {
        this.hosts = hosts;
        this.eGridViewport = eGridViewport;
        this.refresh();
    }

    public registerSource(config: PinnedRowContainerRendererSourceConfig): PinnedRowContainerRendererSource {
        if (this.sources.has(config.id)) {
            throw new Error(`PinnedRowContainerRendererService source already exists: ${config.id}`);
        }

        const state: SourceState = {
            ...config,
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

    public refresh(): void {
        if (!this.hosts) {
            return;
        }
        this.refreshHost('top', 'center');
        this.refreshHost('top', 'fullWidth');
        this.refreshHost('bottom', 'center');
        this.refreshHost('bottom', 'fullWidth');
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
        if (!this.hosts || !this.eGridViewport) {
            return;
        }
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
                if (source.pinToViewportX) {
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
            if (source.insertAfterHeadersBeforeRows) {
                this.insertAfterHeadersBeforeRows(host, eGui);
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
                const orderDiff = (a.order ?? 0) - (b.order ?? 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }
                return a.sequence - b.sequence;
            });
    }

    private insertAfterHeadersBeforeRows(host: HTMLElement, eGui: HTMLElement): void {
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
        if (!this.eGridViewport) {
            return;
        }
        const scrollLeft = Math.abs(this.eGridViewport.scrollLeft);
        eGui.style.position = 'absolute';
        eGui.style.width = `${this.eGridViewport.clientWidth}px`;
        if (source.getViewportOffsetTop) {
            eGui.style.top = `${source.getViewportOffsetTop()}px`;
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
        if (!this.hosts) {
            throw new Error('PinnedRowContainerRendererService not initialised');
        }
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
