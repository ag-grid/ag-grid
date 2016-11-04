import * as ts from 'typescript';
export interface Directory {
    [name: string]: (Directory | string);
}
export declare class Host implements ts.LanguageServiceHost {
    private directory;
    private scripts;
    constructor(directory: Directory, scripts: string[]);
    getCompilationSettings(): ts.CompilerOptions;
    getScriptFileNames(): string[];
    getScriptVersion(fileName: string): string;
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot;
    getCurrentDirectory(): string;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    private getFileContent(fileName);
}
export declare class MockNode implements ts.Node {
    kind: ts.SyntaxKind;
    flags: ts.NodeFlags;
    pos: number;
    end: number;
    constructor(kind?: ts.SyntaxKind, flags?: ts.NodeFlags, pos?: number, end?: number);
    getSourceFile(): ts.SourceFile;
    getChildCount(sourceFile?: ts.SourceFile): number;
    getChildAt(index: number, sourceFile?: ts.SourceFile): ts.Node;
    getChildren(sourceFile?: ts.SourceFile): ts.Node[];
    getStart(sourceFile?: ts.SourceFile): number;
    getFullStart(): number;
    getEnd(): number;
    getWidth(sourceFile?: ts.SourceFile): number;
    getFullWidth(): number;
    getLeadingTriviaWidth(sourceFile?: ts.SourceFile): number;
    getFullText(sourceFile?: ts.SourceFile): string;
    getText(sourceFile?: ts.SourceFile): string;
    getFirstToken(sourceFile?: ts.SourceFile): ts.Node;
    getLastToken(sourceFile?: ts.SourceFile): ts.Node;
}
export declare class MockIdentifier extends MockNode implements ts.Identifier {
    name: string;
    text: string;
    _primaryExpressionBrand: any;
    _memberExpressionBrand: any;
    _leftHandSideExpressionBrand: any;
    _incrementExpressionBrand: any;
    _unaryExpressionBrand: any;
    _expressionBrand: any;
    constructor(name: string, kind?: ts.SyntaxKind, flags?: ts.NodeFlags, pos?: number, end?: number);
}
export declare class MockVariableDeclaration extends MockNode implements ts.VariableDeclaration {
    name: ts.Identifier;
    _declarationBrand: any;
    constructor(name: ts.Identifier, kind?: ts.SyntaxKind, flags?: ts.NodeFlags, pos?: number, end?: number);
    static of(name: string): MockVariableDeclaration;
}
export declare class MockSymbol implements ts.Symbol {
    name: string;
    private node;
    flags: ts.SymbolFlags;
    constructor(name: string, node?: ts.Declaration, flags?: ts.SymbolFlags);
    getFlags(): ts.SymbolFlags;
    getName(): string;
    getDeclarations(): ts.Declaration[];
    getDocumentationComment(): ts.SymbolDisplayPart[];
    static of(name: string): MockSymbol;
}
export declare function expectNoDiagnostics(diagnostics: ts.Diagnostic[]): void;
export declare function expectValidSources(service: ts.LanguageService, program: ts.Program): void;
export declare function allChildren<T>(node: ts.Node, cb: (node: ts.Node) => T): T;
export declare function findClass(sourceFile: ts.SourceFile, name: string): ts.ClassDeclaration;
export declare function findVar(sourceFile: ts.SourceFile, name: string): ts.VariableDeclaration;
export declare function isClass(node: ts.Node): node is ts.ClassDeclaration;
export declare function isNamed(node: ts.Node, name: string): node is ts.Identifier;
export declare function isVar(node: ts.Node): node is ts.VariableDeclaration;
