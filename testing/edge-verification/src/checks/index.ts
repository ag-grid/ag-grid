import type { CheckDef } from '../core/types';
import { agentFileChecks } from './agentFiles';
import { blogChecks } from './blog';
import { botOutcomeChecks } from './botOutcomes';
import { cachingChecks } from './caching';
import { cloudfrontChecks } from './cloudfront';
import { crawlerPolicyChecks } from './crawlerPolicy';
import { headerChecks } from './headers';
import { infraChecks } from './infra';
import { migrationChecks } from './migration';
import { redirectChecks } from './redirects';
import { seoContentChecks } from './seoContent';
import { wafChecks } from './waf';
import { wafBehaviourChecks } from './wafBehaviour';

/** Every check, in report order. */
export function allChecks(): CheckDef[] {
    return [
        ...cloudfrontChecks(),
        ...wafChecks(),
        ...infraChecks(),
        ...redirectChecks(),
        ...migrationChecks(),
        ...headerChecks(),
        ...cachingChecks(),
        ...wafBehaviourChecks(),
        ...crawlerPolicyChecks(),
        ...agentFileChecks(),
        ...seoContentChecks(),
        ...blogChecks(),
        ...botOutcomeChecks(),
    ];
}
