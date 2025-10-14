import type { FrameworkOverridesIncomingSource } from './agStack/interfaces/agFrameworkOverrides';
import { BASE_URL } from './baseUrl';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import { setValidationDocLink } from './validation/logging';

/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
export class VanillaFrameworkOverrides implements IFrameworkOverrides {
    public readonly renderingEngine: 'vanilla' | 'react' = 'vanilla';
    public readonly batchFrameworkComps: boolean = false;
    private readonly baseDocLink: string;

    constructor(private readonly frameworkName: 'javascript' | 'angular' | 'react' | 'vue' = 'javascript') {
        this.baseDocLink = `${BASE_URL}/${this.frameworkName}-data-grid`;
        setValidationDocLink(this.baseDocLink);
    }

    wrapIncoming: <T>(callback: () => T, source?: FrameworkOverridesIncomingSource) => T = (callback) => callback();
    wrapOutgoing: <T>(callback: () => T) => T = (callback) => callback();

    frameworkComponent(_: string): any {
        return null;
    }

    isFrameworkComponent(_: any): boolean {
        return false;
    }

    getDocLink(path?: string): string {
        return this.baseDocLink + (path ? '/' + path : '');
    }
}
