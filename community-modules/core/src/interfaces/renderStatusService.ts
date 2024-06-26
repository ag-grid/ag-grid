import type { ColKey } from '../columns/columnModel';

export interface IRenderStatusService {
    areHeadersRendered(colKeys: ColKey[]): boolean;
}
