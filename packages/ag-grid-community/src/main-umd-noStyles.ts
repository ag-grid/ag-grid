/*
 * Used for umd bundles without styles
 */
import {
    ClientSideRowModelModule,
    CommunityFeaturesModule,
    CsvExportModule,
    InfiniteRowModelModule,
    ModuleRegistry,
} from './main';

ModuleRegistry.__registerModules(
    // [CommunityFeaturesModule, ClientSideRowModelModule],
    [CommunityFeaturesModule, ClientSideRowModelModule, InfiniteRowModelModule, CsvExportModule],
    false,
    undefined
);

export * from './main';
