import { Page } from "puppeteer";

export interface Viewport {
    width: number;
    height: number;
}

export interface Spec {
    name: string;
    steps: SpecStep[];
    defaultViewport?: Viewport;
    exampleSection?: string;
    exampleId?: string;
    path?: string;
    urlParams?: object;
    selector?: string;
    autoRtl?: boolean;
}

export type SpecStep = {
    name: string;
    viewport?: Viewport;
    prepare?: (page: Page) => Promise<void>;
};

export interface SpecResults {
    name: string;
    difference: string | null;
    original: string;
    new: string;
}