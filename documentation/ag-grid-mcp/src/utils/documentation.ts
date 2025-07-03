import fetch from 'node-fetch';
import { Framework, AgGridVersion } from '../types/index.js';

export class DocumentationService {
  private static readonly BASE_URL = 'https://www.ag-grid.com';
  private static readonly ARCHIVE_URL = 'https://www.ag-grid.com/documentation-archive';

  static async fetchDocumentation(path: string, version?: string): Promise<string> {
    const url = version 
      ? `${this.ARCHIVE_URL}/${version}/${path}`
      : `${this.BASE_URL}/${path}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch documentation: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Documentation fetch error: ${error}`);
    }
  }

  static async getVersions(): Promise<AgGridVersion[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/documentation-archive/versions.json`);
      if (!response.ok) {
        return this.getDefaultVersions();
      }
      const data = await response.json() as any;
      return this.parseVersions(data);
    } catch (error) {
      return this.getDefaultVersions();
    }
  }

  static getLatestVersion(): string {
    return '34.0.0';
  }

  static getDocumentationUrl(path: string, version?: string, framework?: Framework): string {
    const frameworkPath = framework && framework !== 'vanilla' ? `/${framework}` : '';
    const versionPath = version ? `/${version}` : '';
    return `${this.BASE_URL}${versionPath}${frameworkPath}/${path}`;
  }

  static getArchiveUrl(version: string, path: string): string {
    return `${this.ARCHIVE_URL}/${version}/${path}`;
  }

  private static getDefaultVersions(): AgGridVersion[] {
    return [
      {
        version: '34.0.0',
        releaseDate: '2024-12-01',
        major: 34,
        minor: 0,
        patch: 0,
        isLatest: true,
        documentationUrl: `${this.BASE_URL}/documentation`,
        changelogUrl: `${this.BASE_URL}/changelog`
      },
      {
        version: '33.3.0',
        releaseDate: '2024-11-01',
        major: 33,
        minor: 3,
        patch: 0,
        isLatest: false,
        documentationUrl: `${this.ARCHIVE_URL}/33.3.0`,
        changelogUrl: `${this.BASE_URL}/changelog`
      }
    ];
  }

  private static parseVersions(data: any): AgGridVersion[] {
    if (!Array.isArray(data)) {
      return this.getDefaultVersions();
    }

    return data.map((version: any) => ({
      version: version.version,
      releaseDate: version.releaseDate,
      major: parseInt(version.version.split('.')[0]),
      minor: parseInt(version.version.split('.')[1]),
      patch: parseInt(version.version.split('.')[2]),
      isLatest: version.isLatest || false,
      documentationUrl: version.documentationUrl || `${this.BASE_URL}/documentation`,
      changelogUrl: version.changelogUrl || `${this.BASE_URL}/changelog`
    }));
  }
}