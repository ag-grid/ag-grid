import { ChartWrapper } from '../../chartWrapper';

export function hexToRGBA(hex: string, alpha: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return alpha ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgba(${r}, ${g}, ${b})`;
}

export function changeOpacity(fills: string[], alpha: number) {
    return fills.map((fill) => {
        const c = ChartWrapper._Util.Color.fromString(fill);
        return new ChartWrapper._Util.Color(c.r, c.g, c.b, alpha).toHexString();
    });
}
