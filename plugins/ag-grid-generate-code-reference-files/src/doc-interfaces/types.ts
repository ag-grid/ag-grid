export type ApiReferenceType = Map<string, ApiReferenceNode>;

export type ApiReferenceNode =
    | InterfaceNode
    | TypeAliasNode
    | TypeLiteralNode
    | TypeReferenceNode
    | EnumNode
    | FunctionNode
    | IndexAccessNode
    | MultiTypeNode
    | ArrayNode;

export type TypeNode = string | ApiReferenceNode;

export interface MemberNode {
    kind: 'member';
    name: string;
    type: TypeNode;
    docs?: string[];
    optional?: boolean;
    defaultValue?: string;
}

export interface InterfaceNode {
    kind: 'interface';
    name: string;
    docs?: string[];
    members: MemberNode[];
    typeParams?: TypeParameterNode[];
    genericsMap?: Record<string, string>;
}

export interface TypeAliasNode {
    kind: 'typeAlias';
    name: string;
    type: TypeNode;
    typeParams?: TypeParameterNode[];
}

export interface TypeLiteralNode {
    kind: 'typeLiteral';
    name?: string;
    members: MemberNode[];
}

export interface TypeReferenceNode {
    kind: 'typeRef';
    type: string;
    typeArguments?: Array<string | TypeReferenceNode>;
}

export interface EnumNode {
    kind: 'enum';
    name: string;
    members: MemberNode[];
}

export interface FunctionNode {
    kind: 'function';
    params?: ParameterNode[];
    typeParams?: TypeParameterNode[];
    returnType: TypeNode;
}

export interface IndexAccessNode {
    kind: 'indexAccess';
    type: TypeNode;
    index: string;
}

export interface MultiTypeNode {
    kind: 'union' | 'intersection' | 'tuple';
    type: TypeNode[];
}

export interface ArrayNode {
    kind: 'array';
    type: TypeNode;
}

export interface ParameterNode {
    kind: 'param';
    name: string;
    type: TypeNode;
}

export interface TypeParameterNode {
    kind: 'typeParam';
    name: string;
    constraint: TypeNode;
    default: TypeNode;
}
