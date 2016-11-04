/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export var $EOF = 0;
export var $TAB = 9;
export var $LF = 10;
export var $VTAB = 11;
export var $FF = 12;
export var $CR = 13;
export var $SPACE = 32;
export var $BANG = 33;
export var $DQ = 34;
export var $HASH = 35;
export var $$ = 36;
export var $PERCENT = 37;
export var $AMPERSAND = 38;
export var $SQ = 39;
export var $LPAREN = 40;
export var $RPAREN = 41;
export var $STAR = 42;
export var $PLUS = 43;
export var $COMMA = 44;
export var $MINUS = 45;
export var $PERIOD = 46;
export var $SLASH = 47;
export var $COLON = 58;
export var $SEMICOLON = 59;
export var $LT = 60;
export var $EQ = 61;
export var $GT = 62;
export var $QUESTION = 63;
export var $0 = 48;
export var $9 = 57;
export var $A = 65;
export var $E = 69;
export var $F = 70;
export var $X = 88;
export var $Z = 90;
export var $LBRACKET = 91;
export var $BACKSLASH = 92;
export var $RBRACKET = 93;
export var $CARET = 94;
export var $_ = 95;
export var $a = 97;
export var $e = 101;
export var $f = 102;
export var $n = 110;
export var $r = 114;
export var $t = 116;
export var $u = 117;
export var $v = 118;
export var $x = 120;
export var $z = 122;
export var $LBRACE = 123;
export var $BAR = 124;
export var $RBRACE = 125;
export var $NBSP = 160;
export var $PIPE = 124;
export var $TILDA = 126;
export var $AT = 64;
export var $BT = 96;
export function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}
export function isDigit(code) {
    return $0 <= code && code <= $9;
}
export function isAsciiLetter(code) {
    return code >= $a && code <= $z || code >= $A && code <= $Z;
}
export function isAsciiHexDigit(code) {
    return code >= $a && code <= $f || code >= $A && code <= $F || isDigit(code);
}
//# sourceMappingURL=chars.js.map