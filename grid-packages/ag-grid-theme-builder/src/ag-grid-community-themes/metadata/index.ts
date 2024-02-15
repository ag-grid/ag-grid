import { bordersMeta } from './borders-meta';
import { colorsMeta } from './colors-meta';
import { coreMeta } from './core-meta';
import { PartMeta } from './metadata-types';
import { quartzIconsMeta } from './quartz-icons-meta';

export const allPartsMeta: PartMeta[] = [coreMeta, colorsMeta, bordersMeta, quartzIconsMeta];

export * from './metadata-types';
