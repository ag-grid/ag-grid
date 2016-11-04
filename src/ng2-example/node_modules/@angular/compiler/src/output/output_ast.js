/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { isPresent } from '../facade/lang';
//// Types
export var TypeModifier;
(function (TypeModifier) {
    TypeModifier[TypeModifier["Const"] = 0] = "Const";
})(TypeModifier || (TypeModifier = {}));
export var Type = (function () {
    function Type(modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        this.modifiers = modifiers;
        if (!modifiers) {
            this.modifiers = [];
        }
    }
    Type.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return Type;
}());
export var BuiltinTypeName;
(function (BuiltinTypeName) {
    BuiltinTypeName[BuiltinTypeName["Dynamic"] = 0] = "Dynamic";
    BuiltinTypeName[BuiltinTypeName["Bool"] = 1] = "Bool";
    BuiltinTypeName[BuiltinTypeName["String"] = 2] = "String";
    BuiltinTypeName[BuiltinTypeName["Int"] = 3] = "Int";
    BuiltinTypeName[BuiltinTypeName["Number"] = 4] = "Number";
    BuiltinTypeName[BuiltinTypeName["Function"] = 5] = "Function";
})(BuiltinTypeName || (BuiltinTypeName = {}));
export var BuiltinType = (function (_super) {
    __extends(BuiltinType, _super);
    function BuiltinType(name, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
    }
    BuiltinType.prototype.visitType = function (visitor, context) {
        return visitor.visitBuiltintType(this, context);
    };
    return BuiltinType;
}(Type));
export var ExternalType = (function (_super) {
    __extends(ExternalType, _super);
    function ExternalType(value, typeParams, modifiers) {
        if (typeParams === void 0) { typeParams = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.value = value;
        this.typeParams = typeParams;
    }
    ExternalType.prototype.visitType = function (visitor, context) {
        return visitor.visitExternalType(this, context);
    };
    return ExternalType;
}(Type));
export var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(of, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.of = of;
    }
    ArrayType.prototype.visitType = function (visitor, context) {
        return visitor.visitArrayType(this, context);
    };
    return ArrayType;
}(Type));
export var MapType = (function (_super) {
    __extends(MapType, _super);
    function MapType(valueType, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.valueType = valueType;
    }
    MapType.prototype.visitType = function (visitor, context) { return visitor.visitMapType(this, context); };
    return MapType;
}(Type));
export var DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
export var BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export var INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
export var NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
export var STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
export var FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);
///// Expressions
export var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Equals"] = 0] = "Equals";
    BinaryOperator[BinaryOperator["NotEquals"] = 1] = "NotEquals";
    BinaryOperator[BinaryOperator["Identical"] = 2] = "Identical";
    BinaryOperator[BinaryOperator["NotIdentical"] = 3] = "NotIdentical";
    BinaryOperator[BinaryOperator["Minus"] = 4] = "Minus";
    BinaryOperator[BinaryOperator["Plus"] = 5] = "Plus";
    BinaryOperator[BinaryOperator["Divide"] = 6] = "Divide";
    BinaryOperator[BinaryOperator["Multiply"] = 7] = "Multiply";
    BinaryOperator[BinaryOperator["Modulo"] = 8] = "Modulo";
    BinaryOperator[BinaryOperator["And"] = 9] = "And";
    BinaryOperator[BinaryOperator["Or"] = 10] = "Or";
    BinaryOperator[BinaryOperator["Lower"] = 11] = "Lower";
    BinaryOperator[BinaryOperator["LowerEquals"] = 12] = "LowerEquals";
    BinaryOperator[BinaryOperator["Bigger"] = 13] = "Bigger";
    BinaryOperator[BinaryOperator["BiggerEquals"] = 14] = "BiggerEquals";
})(BinaryOperator || (BinaryOperator = {}));
export var Expression = (function () {
    function Expression(type) {
        this.type = type;
    }
    Expression.prototype.prop = function (name) { return new ReadPropExpr(this, name); };
    Expression.prototype.key = function (index, type) {
        if (type === void 0) { type = null; }
        return new ReadKeyExpr(this, index, type);
    };
    Expression.prototype.callMethod = function (name, params) {
        return new InvokeMethodExpr(this, name, params);
    };
    Expression.prototype.callFn = function (params) { return new InvokeFunctionExpr(this, params); };
    Expression.prototype.instantiate = function (params, type) {
        if (type === void 0) { type = null; }
        return new InstantiateExpr(this, params, type);
    };
    Expression.prototype.conditional = function (trueCase, falseCase) {
        if (falseCase === void 0) { falseCase = null; }
        return new ConditionalExpr(this, trueCase, falseCase);
    };
    Expression.prototype.equals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs);
    };
    Expression.prototype.notEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs);
    };
    Expression.prototype.identical = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs);
    };
    Expression.prototype.notIdentical = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs);
    };
    Expression.prototype.minus = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs);
    };
    Expression.prototype.plus = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs);
    };
    Expression.prototype.divide = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs);
    };
    Expression.prototype.multiply = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs);
    };
    Expression.prototype.modulo = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs);
    };
    Expression.prototype.and = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.And, this, rhs);
    };
    Expression.prototype.or = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs);
    };
    Expression.prototype.lower = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs);
    };
    Expression.prototype.lowerEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs);
    };
    Expression.prototype.bigger = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs);
    };
    Expression.prototype.biggerEquals = function (rhs) {
        return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs);
    };
    Expression.prototype.isBlank = function () {
        // Note: We use equals by purpose here to compare to null and undefined in JS.
        return this.equals(NULL_EXPR);
    };
    Expression.prototype.cast = function (type) { return new CastExpr(this, type); };
    Expression.prototype.toStmt = function () { return new ExpressionStatement(this); };
    return Expression;
}());
export var BuiltinVar;
(function (BuiltinVar) {
    BuiltinVar[BuiltinVar["This"] = 0] = "This";
    BuiltinVar[BuiltinVar["Super"] = 1] = "Super";
    BuiltinVar[BuiltinVar["CatchError"] = 2] = "CatchError";
    BuiltinVar[BuiltinVar["CatchStack"] = 3] = "CatchStack";
})(BuiltinVar || (BuiltinVar = {}));
export var ReadVarExpr = (function (_super) {
    __extends(ReadVarExpr, _super);
    function ReadVarExpr(name, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        if (typeof name === 'string') {
            this.name = name;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = name;
        }
    }
    ReadVarExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadVarExpr(this, context);
    };
    ReadVarExpr.prototype.set = function (value) { return new WriteVarExpr(this.name, value); };
    return ReadVarExpr;
}(Expression));
export var WriteVarExpr = (function (_super) {
    __extends(WriteVarExpr, _super);
    function WriteVarExpr(name, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type || value.type);
        this.name = name;
        this.value = value;
    }
    WriteVarExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWriteVarExpr(this, context);
    };
    WriteVarExpr.prototype.toDeclStmt = function (type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        return new DeclareVarStmt(this.name, this.value, type, modifiers);
    };
    return WriteVarExpr;
}(Expression));
export var WriteKeyExpr = (function (_super) {
    __extends(WriteKeyExpr, _super);
    function WriteKeyExpr(receiver, index, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type || value.type);
        this.receiver = receiver;
        this.index = index;
        this.value = value;
    }
    WriteKeyExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWriteKeyExpr(this, context);
    };
    return WriteKeyExpr;
}(Expression));
export var WritePropExpr = (function (_super) {
    __extends(WritePropExpr, _super);
    function WritePropExpr(receiver, name, value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type || value.type);
        this.receiver = receiver;
        this.name = name;
        this.value = value;
    }
    WritePropExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitWritePropExpr(this, context);
    };
    return WritePropExpr;
}(Expression));
export var BuiltinMethod;
(function (BuiltinMethod) {
    BuiltinMethod[BuiltinMethod["ConcatArray"] = 0] = "ConcatArray";
    BuiltinMethod[BuiltinMethod["SubscribeObservable"] = 1] = "SubscribeObservable";
    BuiltinMethod[BuiltinMethod["Bind"] = 2] = "Bind";
})(BuiltinMethod || (BuiltinMethod = {}));
export var InvokeMethodExpr = (function (_super) {
    __extends(InvokeMethodExpr, _super);
    function InvokeMethodExpr(receiver, method, args, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.args = args;
        if (typeof method === 'string') {
            this.name = method;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = method;
        }
    }
    InvokeMethodExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInvokeMethodExpr(this, context);
    };
    return InvokeMethodExpr;
}(Expression));
export var InvokeFunctionExpr = (function (_super) {
    __extends(InvokeFunctionExpr, _super);
    function InvokeFunctionExpr(fn, args, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.fn = fn;
        this.args = args;
    }
    InvokeFunctionExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInvokeFunctionExpr(this, context);
    };
    return InvokeFunctionExpr;
}(Expression));
export var InstantiateExpr = (function (_super) {
    __extends(InstantiateExpr, _super);
    function InstantiateExpr(classExpr, args, type) {
        _super.call(this, type);
        this.classExpr = classExpr;
        this.args = args;
    }
    InstantiateExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitInstantiateExpr(this, context);
    };
    return InstantiateExpr;
}(Expression));
export var LiteralExpr = (function (_super) {
    __extends(LiteralExpr, _super);
    function LiteralExpr(value, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.value = value;
    }
    LiteralExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralExpr(this, context);
    };
    return LiteralExpr;
}(Expression));
export var ExternalExpr = (function (_super) {
    __extends(ExternalExpr, _super);
    function ExternalExpr(value, type, typeParams) {
        if (type === void 0) { type = null; }
        if (typeParams === void 0) { typeParams = null; }
        _super.call(this, type);
        this.value = value;
        this.typeParams = typeParams;
    }
    ExternalExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitExternalExpr(this, context);
    };
    return ExternalExpr;
}(Expression));
export var ConditionalExpr = (function (_super) {
    __extends(ConditionalExpr, _super);
    function ConditionalExpr(condition, trueCase, falseCase, type) {
        if (falseCase === void 0) { falseCase = null; }
        if (type === void 0) { type = null; }
        _super.call(this, type || trueCase.type);
        this.condition = condition;
        this.falseCase = falseCase;
        this.trueCase = trueCase;
    }
    ConditionalExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitConditionalExpr(this, context);
    };
    return ConditionalExpr;
}(Expression));
export var NotExpr = (function (_super) {
    __extends(NotExpr, _super);
    function NotExpr(condition) {
        _super.call(this, BOOL_TYPE);
        this.condition = condition;
    }
    NotExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitNotExpr(this, context);
    };
    return NotExpr;
}(Expression));
export var CastExpr = (function (_super) {
    __extends(CastExpr, _super);
    function CastExpr(value, type) {
        _super.call(this, type);
        this.value = value;
    }
    CastExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitCastExpr(this, context);
    };
    return CastExpr;
}(Expression));
export var FnParam = (function () {
    function FnParam(name, type) {
        if (type === void 0) { type = null; }
        this.name = name;
        this.type = type;
    }
    return FnParam;
}());
export var FunctionExpr = (function (_super) {
    __extends(FunctionExpr, _super);
    function FunctionExpr(params, statements, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.params = params;
        this.statements = statements;
    }
    FunctionExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitFunctionExpr(this, context);
    };
    FunctionExpr.prototype.toDeclStmt = function (name, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        return new DeclareFunctionStmt(name, this.params, this.statements, this.type, modifiers);
    };
    return FunctionExpr;
}(Expression));
export var BinaryOperatorExpr = (function (_super) {
    __extends(BinaryOperatorExpr, _super);
    function BinaryOperatorExpr(operator, lhs, rhs, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type || lhs.type);
        this.operator = operator;
        this.rhs = rhs;
        this.lhs = lhs;
    }
    BinaryOperatorExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitBinaryOperatorExpr(this, context);
    };
    return BinaryOperatorExpr;
}(Expression));
export var ReadPropExpr = (function (_super) {
    __extends(ReadPropExpr, _super);
    function ReadPropExpr(receiver, name, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.name = name;
    }
    ReadPropExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadPropExpr(this, context);
    };
    ReadPropExpr.prototype.set = function (value) {
        return new WritePropExpr(this.receiver, this.name, value);
    };
    return ReadPropExpr;
}(Expression));
export var ReadKeyExpr = (function (_super) {
    __extends(ReadKeyExpr, _super);
    function ReadKeyExpr(receiver, index, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.receiver = receiver;
        this.index = index;
    }
    ReadKeyExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitReadKeyExpr(this, context);
    };
    ReadKeyExpr.prototype.set = function (value) {
        return new WriteKeyExpr(this.receiver, this.index, value);
    };
    return ReadKeyExpr;
}(Expression));
export var LiteralArrayExpr = (function (_super) {
    __extends(LiteralArrayExpr, _super);
    function LiteralArrayExpr(entries, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.entries = entries;
    }
    LiteralArrayExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralArrayExpr(this, context);
    };
    return LiteralArrayExpr;
}(Expression));
export var LiteralMapExpr = (function (_super) {
    __extends(LiteralMapExpr, _super);
    function LiteralMapExpr(entries, type) {
        if (type === void 0) { type = null; }
        _super.call(this, type);
        this.entries = entries;
        this.valueType = null;
        if (isPresent(type)) {
            this.valueType = type.valueType;
        }
    }
    LiteralMapExpr.prototype.visitExpression = function (visitor, context) {
        return visitor.visitLiteralMapExpr(this, context);
    };
    return LiteralMapExpr;
}(Expression));
export var THIS_EXPR = new ReadVarExpr(BuiltinVar.This);
export var SUPER_EXPR = new ReadVarExpr(BuiltinVar.Super);
export var CATCH_ERROR_VAR = new ReadVarExpr(BuiltinVar.CatchError);
export var CATCH_STACK_VAR = new ReadVarExpr(BuiltinVar.CatchStack);
export var NULL_EXPR = new LiteralExpr(null, null);
//// Statements
export var StmtModifier;
(function (StmtModifier) {
    StmtModifier[StmtModifier["Final"] = 0] = "Final";
    StmtModifier[StmtModifier["Private"] = 1] = "Private";
})(StmtModifier || (StmtModifier = {}));
export var Statement = (function () {
    function Statement(modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        this.modifiers = modifiers;
        if (!modifiers) {
            this.modifiers = [];
        }
    }
    Statement.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return Statement;
}());
export var DeclareVarStmt = (function (_super) {
    __extends(DeclareVarStmt, _super);
    function DeclareVarStmt(name, value, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.value = value;
        this.type = type || value.type;
    }
    DeclareVarStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareVarStmt(this, context);
    };
    return DeclareVarStmt;
}(Statement));
export var DeclareFunctionStmt = (function (_super) {
    __extends(DeclareFunctionStmt, _super);
    function DeclareFunctionStmt(name, params, statements, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.params = params;
        this.statements = statements;
        this.type = type;
    }
    DeclareFunctionStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareFunctionStmt(this, context);
    };
    return DeclareFunctionStmt;
}(Statement));
export var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement(expr) {
        _super.call(this);
        this.expr = expr;
    }
    ExpressionStatement.prototype.visitStatement = function (visitor, context) {
        return visitor.visitExpressionStmt(this, context);
    };
    return ExpressionStatement;
}(Statement));
export var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement(value) {
        _super.call(this);
        this.value = value;
    }
    ReturnStatement.prototype.visitStatement = function (visitor, context) {
        return visitor.visitReturnStmt(this, context);
    };
    return ReturnStatement;
}(Statement));
export var AbstractClassPart = (function () {
    function AbstractClassPart(type, modifiers) {
        if (type === void 0) { type = null; }
        this.type = type;
        this.modifiers = modifiers;
        if (!modifiers) {
            this.modifiers = [];
        }
    }
    AbstractClassPart.prototype.hasModifier = function (modifier) { return this.modifiers.indexOf(modifier) !== -1; };
    return AbstractClassPart;
}());
export var ClassField = (function (_super) {
    __extends(ClassField, _super);
    function ClassField(name, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
    }
    return ClassField;
}(AbstractClassPart));
export var ClassMethod = (function (_super) {
    __extends(ClassMethod, _super);
    function ClassMethod(name, params, body, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
        this.params = params;
        this.body = body;
    }
    return ClassMethod;
}(AbstractClassPart));
export var ClassGetter = (function (_super) {
    __extends(ClassGetter, _super);
    function ClassGetter(name, body, type, modifiers) {
        if (type === void 0) { type = null; }
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, type, modifiers);
        this.name = name;
        this.body = body;
    }
    return ClassGetter;
}(AbstractClassPart));
export var ClassStmt = (function (_super) {
    __extends(ClassStmt, _super);
    function ClassStmt(name, parent, fields, getters, constructorMethod, methods, modifiers) {
        if (modifiers === void 0) { modifiers = null; }
        _super.call(this, modifiers);
        this.name = name;
        this.parent = parent;
        this.fields = fields;
        this.getters = getters;
        this.constructorMethod = constructorMethod;
        this.methods = methods;
    }
    ClassStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitDeclareClassStmt(this, context);
    };
    return ClassStmt;
}(Statement));
export var IfStmt = (function (_super) {
    __extends(IfStmt, _super);
    function IfStmt(condition, trueCase, falseCase) {
        if (falseCase === void 0) { falseCase = []; }
        _super.call(this);
        this.condition = condition;
        this.trueCase = trueCase;
        this.falseCase = falseCase;
    }
    IfStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitIfStmt(this, context);
    };
    return IfStmt;
}(Statement));
export var CommentStmt = (function (_super) {
    __extends(CommentStmt, _super);
    function CommentStmt(comment) {
        _super.call(this);
        this.comment = comment;
    }
    CommentStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitCommentStmt(this, context);
    };
    return CommentStmt;
}(Statement));
export var TryCatchStmt = (function (_super) {
    __extends(TryCatchStmt, _super);
    function TryCatchStmt(bodyStmts, catchStmts) {
        _super.call(this);
        this.bodyStmts = bodyStmts;
        this.catchStmts = catchStmts;
    }
    TryCatchStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitTryCatchStmt(this, context);
    };
    return TryCatchStmt;
}(Statement));
export var ThrowStmt = (function (_super) {
    __extends(ThrowStmt, _super);
    function ThrowStmt(error) {
        _super.call(this);
        this.error = error;
    }
    ThrowStmt.prototype.visitStatement = function (visitor, context) {
        return visitor.visitThrowStmt(this, context);
    };
    return ThrowStmt;
}(Statement));
export var ExpressionTransformer = (function () {
    function ExpressionTransformer() {
    }
    ExpressionTransformer.prototype.visitReadVarExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitWriteVarExpr = function (expr, context) {
        return new WriteVarExpr(expr.name, expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitWriteKeyExpr = function (expr, context) {
        return new WriteKeyExpr(expr.receiver.visitExpression(this, context), expr.index.visitExpression(this, context), expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitWritePropExpr = function (expr, context) {
        return new WritePropExpr(expr.receiver.visitExpression(this, context), expr.name, expr.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitInvokeMethodExpr = function (ast, context) {
        var method = ast.builtin || ast.name;
        return new InvokeMethodExpr(ast.receiver.visitExpression(this, context), method, this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitInvokeFunctionExpr = function (ast, context) {
        return new InvokeFunctionExpr(ast.fn.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitInstantiateExpr = function (ast, context) {
        return new InstantiateExpr(ast.classExpr.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    };
    ExpressionTransformer.prototype.visitLiteralExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitExternalExpr = function (ast, context) { return ast; };
    ExpressionTransformer.prototype.visitConditionalExpr = function (ast, context) {
        return new ConditionalExpr(ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitNotExpr = function (ast, context) {
        return new NotExpr(ast.condition.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitCastExpr = function (ast, context) {
        return new CastExpr(ast.value.visitExpression(this, context), context);
    };
    ExpressionTransformer.prototype.visitFunctionExpr = function (ast, context) {
        // Don't descend into nested functions
        return ast;
    };
    ExpressionTransformer.prototype.visitBinaryOperatorExpr = function (ast, context) {
        return new BinaryOperatorExpr(ast.operator, ast.lhs.visitExpression(this, context), ast.rhs.visitExpression(this, context), ast.type);
    };
    ExpressionTransformer.prototype.visitReadPropExpr = function (ast, context) {
        return new ReadPropExpr(ast.receiver.visitExpression(this, context), ast.name, ast.type);
    };
    ExpressionTransformer.prototype.visitReadKeyExpr = function (ast, context) {
        return new ReadKeyExpr(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context), ast.type);
    };
    ExpressionTransformer.prototype.visitLiteralArrayExpr = function (ast, context) {
        return new LiteralArrayExpr(this.visitAllExpressions(ast.entries, context));
    };
    ExpressionTransformer.prototype.visitLiteralMapExpr = function (ast, context) {
        var _this = this;
        var entries = ast.entries.map(function (entry) { return [entry[0], entry[1].visitExpression(_this, context),]; });
        return new LiteralMapExpr(entries);
    };
    ExpressionTransformer.prototype.visitAllExpressions = function (exprs, context) {
        var _this = this;
        return exprs.map(function (expr) { return expr.visitExpression(_this, context); });
    };
    ExpressionTransformer.prototype.visitDeclareVarStmt = function (stmt, context) {
        return new DeclareVarStmt(stmt.name, stmt.value.visitExpression(this, context), stmt.type, stmt.modifiers);
    };
    ExpressionTransformer.prototype.visitDeclareFunctionStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    ExpressionTransformer.prototype.visitExpressionStmt = function (stmt, context) {
        return new ExpressionStatement(stmt.expr.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitReturnStmt = function (stmt, context) {
        return new ReturnStatement(stmt.value.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitDeclareClassStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    ExpressionTransformer.prototype.visitIfStmt = function (stmt, context) {
        return new IfStmt(stmt.condition.visitExpression(this, context), this.visitAllStatements(stmt.trueCase, context), this.visitAllStatements(stmt.falseCase, context));
    };
    ExpressionTransformer.prototype.visitTryCatchStmt = function (stmt, context) {
        return new TryCatchStmt(this.visitAllStatements(stmt.bodyStmts, context), this.visitAllStatements(stmt.catchStmts, context));
    };
    ExpressionTransformer.prototype.visitThrowStmt = function (stmt, context) {
        return new ThrowStmt(stmt.error.visitExpression(this, context));
    };
    ExpressionTransformer.prototype.visitCommentStmt = function (stmt, context) { return stmt; };
    ExpressionTransformer.prototype.visitAllStatements = function (stmts, context) {
        var _this = this;
        return stmts.map(function (stmt) { return stmt.visitStatement(_this, context); });
    };
    return ExpressionTransformer;
}());
export var RecursiveExpressionVisitor = (function () {
    function RecursiveExpressionVisitor() {
    }
    RecursiveExpressionVisitor.prototype.visitReadVarExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitWriteVarExpr = function (expr, context) {
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitWriteKeyExpr = function (expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.index.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitWritePropExpr = function (expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    };
    RecursiveExpressionVisitor.prototype.visitInvokeMethodExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitInvokeFunctionExpr = function (ast, context) {
        ast.fn.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitInstantiateExpr = function (ast, context) {
        ast.classExpr.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitExternalExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitConditionalExpr = function (ast, context) {
        ast.condition.visitExpression(this, context);
        ast.trueCase.visitExpression(this, context);
        ast.falseCase.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitNotExpr = function (ast, context) {
        ast.condition.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitCastExpr = function (ast, context) {
        ast.value.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitFunctionExpr = function (ast, context) { return ast; };
    RecursiveExpressionVisitor.prototype.visitBinaryOperatorExpr = function (ast, context) {
        ast.lhs.visitExpression(this, context);
        ast.rhs.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitReadPropExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitReadKeyExpr = function (ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.index.visitExpression(this, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralArrayExpr = function (ast, context) {
        this.visitAllExpressions(ast.entries, context);
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitLiteralMapExpr = function (ast, context) {
        var _this = this;
        ast.entries.forEach(function (entry) { return entry[1].visitExpression(_this, context); });
        return ast;
    };
    RecursiveExpressionVisitor.prototype.visitAllExpressions = function (exprs, context) {
        var _this = this;
        exprs.forEach(function (expr) { return expr.visitExpression(_this, context); });
    };
    RecursiveExpressionVisitor.prototype.visitDeclareVarStmt = function (stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitDeclareFunctionStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitExpressionStmt = function (stmt, context) {
        stmt.expr.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitReturnStmt = function (stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitDeclareClassStmt = function (stmt, context) {
        // Don't descend into nested functions
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitIfStmt = function (stmt, context) {
        stmt.condition.visitExpression(this, context);
        this.visitAllStatements(stmt.trueCase, context);
        this.visitAllStatements(stmt.falseCase, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitTryCatchStmt = function (stmt, context) {
        this.visitAllStatements(stmt.bodyStmts, context);
        this.visitAllStatements(stmt.catchStmts, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitThrowStmt = function (stmt, context) {
        stmt.error.visitExpression(this, context);
        return stmt;
    };
    RecursiveExpressionVisitor.prototype.visitCommentStmt = function (stmt, context) { return stmt; };
    RecursiveExpressionVisitor.prototype.visitAllStatements = function (stmts, context) {
        var _this = this;
        stmts.forEach(function (stmt) { return stmt.visitStatement(_this, context); });
    };
    return RecursiveExpressionVisitor;
}());
export function replaceVarInExpression(varName, newValue, expression) {
    var transformer = new _ReplaceVariableTransformer(varName, newValue);
    return expression.visitExpression(transformer, null);
}
var _ReplaceVariableTransformer = (function (_super) {
    __extends(_ReplaceVariableTransformer, _super);
    function _ReplaceVariableTransformer(_varName, _newValue) {
        _super.call(this);
        this._varName = _varName;
        this._newValue = _newValue;
    }
    _ReplaceVariableTransformer.prototype.visitReadVarExpr = function (ast, context) {
        return ast.name == this._varName ? this._newValue : ast;
    };
    return _ReplaceVariableTransformer;
}(ExpressionTransformer));
export function findReadVarNames(stmts) {
    var finder = new _VariableFinder();
    finder.visitAllStatements(stmts, null);
    return finder.varNames;
}
var _VariableFinder = (function (_super) {
    __extends(_VariableFinder, _super);
    function _VariableFinder() {
        _super.apply(this, arguments);
        this.varNames = new Set();
    }
    _VariableFinder.prototype.visitReadVarExpr = function (ast, context) {
        this.varNames.add(ast.name);
        return null;
    };
    return _VariableFinder;
}(RecursiveExpressionVisitor));
export function variable(name, type) {
    if (type === void 0) { type = null; }
    return new ReadVarExpr(name, type);
}
export function importExpr(id, typeParams) {
    if (typeParams === void 0) { typeParams = null; }
    return new ExternalExpr(id, null, typeParams);
}
export function importType(id, typeParams, typeModifiers) {
    if (typeParams === void 0) { typeParams = null; }
    if (typeModifiers === void 0) { typeModifiers = null; }
    return isPresent(id) ? new ExternalType(id, typeParams, typeModifiers) : null;
}
export function literalArr(values, type) {
    if (type === void 0) { type = null; }
    return new LiteralArrayExpr(values, type);
}
export function literalMap(values, type) {
    if (type === void 0) { type = null; }
    return new LiteralMapExpr(values, type);
}
export function not(expr) {
    return new NotExpr(expr);
}
export function fn(params, body, type) {
    if (type === void 0) { type = null; }
    return new FunctionExpr(params, body, type);
}
export function literal(value, type) {
    if (type === void 0) { type = null; }
    return new LiteralExpr(value, type);
}
//# sourceMappingURL=output_ast.js.map