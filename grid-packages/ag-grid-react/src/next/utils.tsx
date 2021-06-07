export function classesList(...list: (string | null | undefined)[]): string {
    const filtered = list.filter( s => s != null && s != '');
    return filtered.join(' ');
}