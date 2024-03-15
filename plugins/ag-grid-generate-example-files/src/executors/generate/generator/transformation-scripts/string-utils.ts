export function toTitleCase(value) {
    const camelCased = value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return camelCased[0].toUpperCase() + camelCased.slice(1);
}

export const toKebabCase = (value: string) => value.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
