import { Bean, PostConstruct } from "ag-grid-community";

@Bean('md5')
export class MD5 {
    private ieCompatibility = false;

    @PostConstruct
    private init():void {
        this.ieCompatibility = (this.md5('hello') != '5d41402abc4b2a76b9719d911017c592');
    }

    private  md5cycle(x:any, k:any) {
        let a:any = x[0], b:any = x[1], c:any = x[2], d:any = x[3];

        a = this.ff(a, b, c, d, k[0], 7, -680876936);
        d = this.ff(d, a, b, c, k[1], 12, -389564586);
        c = this.ff(c, d, a, b, k[2], 17, 606105819);
        b = this.ff(b, c, d, a, k[3], 22, -1044525330);
        a = this.ff(a, b, c, d, k[4], 7, -176418897);
        d = this.ff(d, a, b, c, k[5], 12, 1200080426);
        c = this.ff(c, d, a, b, k[6], 17, -1473231341);
        b = this.ff(b, c, d, a, k[7], 22, -45705983);
        a = this.ff(a, b, c, d, k[8], 7, 1770035416);
        d = this.ff(d, a, b, c, k[9], 12, -1958414417);
        c = this.ff(c, d, a, b, k[10], 17, -42063);
        b = this.ff(b, c, d, a, k[11], 22, -1990404162);
        a = this.ff(a, b, c, d, k[12], 7, 1804603682);
        d = this.ff(d, a, b, c, k[13], 12, -40341101);
        c = this.ff(c, d, a, b, k[14], 17, -1502002290);
        b = this.ff(b, c, d, a, k[15], 22, 1236535329);

        a = this.gg(a, b, c, d, k[1], 5, -165796510);
        d = this.gg(d, a, b, c, k[6], 9, -1069501632);
        c = this.gg(c, d, a, b, k[11], 14, 643717713);
        b = this.gg(b, c, d, a, k[0], 20, -373897302);
        a = this.gg(a, b, c, d, k[5], 5, -701558691);
        d = this.gg(d, a, b, c, k[10], 9, 38016083);
        c = this.gg(c, d, a, b, k[15], 14, -660478335);
        b = this.gg(b, c, d, a, k[4], 20, -405537848);
        a = this.gg(a, b, c, d, k[9], 5, 568446438);
        d = this.gg(d, a, b, c, k[14], 9, -1019803690);
        c = this.gg(c, d, a, b, k[3], 14, -187363961);
        b = this.gg(b, c, d, a, k[8], 20, 1163531501);
        a = this.gg(a, b, c, d, k[13], 5, -1444681467);
        d = this.gg(d, a, b, c, k[2], 9, -51403784);
        c = this.gg(c, d, a, b, k[7], 14, 1735328473);
        b = this.gg(b, c, d, a, k[12], 20, -1926607734);

        a = this.hh(a, b, c, d, k[5], 4, -378558);
        d = this.hh(d, a, b, c, k[8], 11, -2022574463);
        c = this.hh(c, d, a, b, k[11], 16, 1839030562);
        b = this.hh(b, c, d, a, k[14], 23, -35309556);
        a = this.hh(a, b, c, d, k[1], 4, -1530992060);
        d = this.hh(d, a, b, c, k[4], 11, 1272893353);
        c = this.hh(c, d, a, b, k[7], 16, -155497632);
        b = this.hh(b, c, d, a, k[10], 23, -1094730640);
        a = this.hh(a, b, c, d, k[13], 4, 681279174);
        d = this.hh(d, a, b, c, k[0], 11, -358537222);
        c = this.hh(c, d, a, b, k[3], 16, -722521979);
        b = this.hh(b, c, d, a, k[6], 23, 76029189);
        a = this.hh(a, b, c, d, k[9], 4, -640364487);
        d = this.hh(d, a, b, c, k[12], 11, -421815835);
        c = this.hh(c, d, a, b, k[15], 16, 530742520);
        b = this.hh(b, c, d, a, k[2], 23, -995338651);

        a = this.ii(a, b, c, d, k[0], 6, -198630844);
        d = this.ii(d, a, b, c, k[7], 10, 1126891415);
        c = this.ii(c, d, a, b, k[14], 15, -1416354905);
        b = this.ii(b, c, d, a, k[5], 21, -57434055);
        a = this.ii(a, b, c, d, k[12], 6, 1700485571);
        d = this.ii(d, a, b, c, k[3], 10, -1894986606);
        c = this.ii(c, d, a, b, k[10], 15, -1051523);
        b = this.ii(b, c, d, a, k[1], 21, -2054922799);
        a = this.ii(a, b, c, d, k[8], 6, 1873313359);
        d = this.ii(d, a, b, c, k[15], 10, -30611744);
        c = this.ii(c, d, a, b, k[6], 15, -1560198380);
        b = this.ii(b, c, d, a, k[13], 21, 1309151649);
        a = this.ii(a, b, c, d, k[4], 6, -145523070);
        d = this.ii(d, a, b, c, k[11], 10, -1120210379);
        c = this.ii(c, d, a, b, k[2], 15, 718787259);
        b = this.ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = this.add32(a, x[0]);
        x[1] = this.add32(b, x[1]);
        x[2] = this.add32(c, x[2]);
        x[3] = this.add32(d, x[3]);
    }

    private cmn(q:any, a:any, b:any, x:any, s:any, t:any) {
        a = this.add32(this.add32(a, q), this.add32(x, t));
        return this.add32((a << s) | (a >>> (32 - s)), b);
    }

    private ff(a:any, b:any, c:any, d:any, x:any, s:any, t:any) {
        return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    private gg(a:any, b:any, c:any, d:any, x:any, s:any, t:any) {
        return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    private hh(a:any, b:any, c:any, d:any, x:any, s:any, t:any) {
        return this.cmn(b ^ c ^ d, a, b, x, s, t);
    }

    private ii(a:any, b:any, c:any, d:any, x:any, s:any, t:any) {
        return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    private md51(s:any) {
        const n:any = s.length;
        const state:any = [1732584193, -271733879, -1732584194, 271733878];
        let i:any;
        for (i = 64; i <= s.length; i += 64) {
            this.md5cycle(state, this.md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++) {
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        }
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            this.md5cycle(state, tail);
            for (i = 0; i < 16; i++) { tail[i] = 0; }
        }
        tail[14] = n * 8;
        this.md5cycle(state, tail);
        return state;
    }

    /* there needs to be support for Unicode here, * unless we pretend that we can redefine the MD-5
     * algorithm for multi-byte characters (perhaps by adding every four 16-bit characters and
     * shortening the sum to 32 bits). Otherwise I suthis.ggest performing MD-5 as if every character
     * was two bytes--e.g., 0040 0025 = @%--but then how will an ordinary MD-5 sum be matched?
     * There is no way to standardize text to something like UTF-8 before transformation; speed cost is
     * utterly prohibitive. The JavaScript standard itself needs to look at this: it should start
     * providing access to strings as preformed UTF-8 8-bit unsigned value arrays.
     */
    private md5blk(s:any) { /* I figured global was faster.   */
        const md5blks:any = [];

        /* Andy King said do it this way. */
        for (let i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i)
                + (s.charCodeAt(i + 1) << 8)
                + (s.charCodeAt(i + 2) << 16)
                + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    private rhex(n:any) {
        const hex_chr:any = '0123456789abcdef'.split('');
        let s:string = '', j:any = 0;
        for (; j < 4; j++) {
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
                + hex_chr[(n >> (j * 8)) & 0x0F];
        }
        return s;
    }

    private hex(x:any) {
        for (let i:any = 0; i < x.length; i++) {
            x[i] = this.rhex(x[i]);
        }
        return x.join('');
    }

    public md5(s:any) {
        return this.hex(this.md51(s));
    }

    private add32(a:any, b:any) {
        return this.ieCompatibility ? this.add32Compat(a, b) : this.add32Std(a, b);
    }

    /* this function is much faster, so if possible we use it. Some IEs are the only ones I know of that
     need the idiotic second function, generated by an if clause.  */
    private add32Std(a:any, b:any) {
        return (a + b) & 0xFFFFFFFF;
    }

    private add32Compat(x:any, y:any) {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

}
