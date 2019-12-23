import { Page } from "puppeteer";

export interface Viewport {
    width: number;
    height: number;
  }
  
  export interface SpecBase {
    defaultViewport?: Viewport;
    exampleSection?: string;
    exampleId?: string;
    path?: string;
    selector?: string;
    autoRtl?: boolean;
    community?: boolean;
    exampleType?: 'generated' | 'multi' | 'vanilla';
}

export type UrlParams = {[key: string]: string | number | boolean};

export interface SpecDefinition extends SpecBase {
    name?: string;
    steps?: SpecStep[];
    urlParams?: UrlParams;
    defaultViewport?: Viewport;
    withoutThemes?: string[];
}

export interface Spec extends SpecDefinition {
    name: string;
    steps: SpecStep[];
    urlParams: UrlParams;
    defaultViewport: Viewport;
    withoutThemes: string[];
}

export type SpecStep = {
    name: string;
    viewport?: Viewport;
    selector?: string;
    prepare?: (page: Page) => Promise<void>;
};

export interface SpecResults {
    name: string;
    difference: string | null;
    original: string;
    new: string;
}