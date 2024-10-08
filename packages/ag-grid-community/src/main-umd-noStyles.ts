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

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    CsvExportModule,
]);

export * from './main';
