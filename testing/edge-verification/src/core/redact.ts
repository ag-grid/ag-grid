/**
 * Every secret value the suite reads (WAF verify-header search strings, the CloudFront origin
 * custom header) is registered here as soon as it is parsed, and every line the reporter prints
 * goes through `redact`. Checks compare secrets in memory and only ever describe them by header
 * name and length, so this is the second line of defence, not the first.
 */
const secrets = new Set<string>();

/** Header names whose values are bypass secrets. Matched case-insensitively. */
export const SECRET_HEADER_PATTERN = /verify/i;

export function registerSecret(value: string | undefined): void {
    // Short values would redact ordinary words; none of the real secrets is under 16 characters.
    if (value && value.length >= 16) {
        secrets.add(value);
    }
}

export function redact(text: string): string {
    let out = text;
    for (const secret of secrets) {
        out = out.split(secret).join('<redacted>');
    }
    return out;
}

/** Describes a secret without revealing it. */
export function describeSecret(value: string | undefined): string {
    return value ? `<${value.length} chars>` : '<missing>';
}
