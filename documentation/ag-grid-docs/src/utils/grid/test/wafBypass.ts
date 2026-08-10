/**
 * The deployed site sits behind an AWS WAF that can block a CI runner's IP outright, turning every page
 * into a 403. A WAF allow-rule matches this header, so the two must be kept in step, and that rule must
 * sit ahead of the IP-reputation rule to take effect.
 */
export const WAF_BYPASS_HEADER = 'x-ag-ci-verify';

/**
 * Gated on GITHUB_ACTIONS rather than CI, which is also set in local shells and would send the secret to
 * whatever host a local run points at. Undefined means no bypass, and no header is attached at all.
 */
export const wafBypassSecret =
    process.env.GITHUB_ACTIONS === 'true' ? process.env.AWS_CI_BYPASS_SECRET || undefined : undefined;
