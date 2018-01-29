// ag-grid-enterprise v16.0.1
export declare class MD5 {
    private ieCompatibility;
    private init();
    private md5cycle(x, k);
    private cmn(q, a, b, x, s, t);
    private ff(a, b, c, d, x, s, t);
    private gg(a, b, c, d, x, s, t);
    private hh(a, b, c, d, x, s, t);
    private ii(a, b, c, d, x, s, t);
    private md51(s);
    private md5blk(s);
    private rhex(n);
    private hex(x);
    md5(s: any): any;
    private add32(a, b);
    private add32Std(a, b);
    private add32Compat(x, y);
}
