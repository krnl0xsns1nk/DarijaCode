import { DjType } from "./codegen/types";
export interface Position {
  line: number;
  column: number;
}

export interface BaseNode {
  pos: Position;
}

export type Node = Statement | Expression;

export interface Program extends BaseNode {
  type: "Program";
  body: Statement[];
}

export type Statement =
  | VariableDeclaration
  | FunctionDeclaration
  | ReturnStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | BreakStatement
  | ContinueStatement
  | BlockStatement
  | ClassDeclaration
  | PrintStatement
  | ExpressionStatement;

export interface VariableDeclaration extends BaseNode {
  type: "VariableDeclaration";
  kind: "dir" | "khli"; 
  name: string;
  typeAnnotation?: DjType;
  init: Expression | null;
}

export interface Param extends BaseNode {
  type: "Param";
  name: string;
  typeAnnotation?: DjType;
  defaultValue: Expression | null;
  rest: boolean; 
}

export interface FunctionDeclaration extends BaseNode {
  type: "FunctionDeclaration";
  name: string;
  params: Param[];
  returnType?: DjType;
  body: BlockStatement;
}

export interface ReturnStatement extends BaseNode {
  type: "ReturnStatement";
  argument: Expression | null;
}

export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  consequent: BlockStatement;
  elseIfs: { condition: Expression; consequent: BlockStatement }[];
  alternate: BlockStatement | null; // wla
}

export interface WhileStatement extends BaseNode {
  type: "WhileStatement";
  condition: Expression;
  body: BlockStatement;
}

export interface ForStatement extends BaseNode {
  type: "ForStatement";
  init: VariableDeclaration | ExpressionStatement | null;
  condition: Expression | null;
  update: Expression | null;
  body: BlockStatement;
}

export interface BreakStatement extends BaseNode {
  type: "BreakStatement";
}

export interface ContinueStatement extends BaseNode {
  type: "ContinueStatement";
}

export interface BlockStatement extends BaseNode {
  type: "BlockStatement";
  body: Statement[];
}

export interface ClassMember extends BaseNode {
  type: "ClassMember";
  kind: "field" | "method" | "constructor";
  visibility: "public" | "private";
  name: string;
  typeAnnotation: string | null;
  params: Param[] | null; // methods / constructor
  body: BlockStatement | null; // methods / constructor
  value: Expression | null; // fields
}

export interface ClassDeclaration extends BaseNode {
  type: "ClassDeclaration";
  name: string;
  superClass: string | null; // wraatmn
  members: ClassMember[];
}

export interface PrintStatement extends BaseNode {
  type: "PrintStatement";
  argument: Expression;
}

export interface ExpressionStatement extends BaseNode {
  type: "ExpressionStatement";
  expression: Expression;
}

export type Expression =
  | Identifier
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | ArrayExpression
  | AssignmentExpression
  | BinaryExpression
  | LogicalExpression
  | UnaryExpression
  | UpdateExpression
  | ConditionalExpression
  | CallExpression
  | MemberExpression
  | ThisExpression
  | NewExpression;

export interface Identifier extends BaseNode {
  type: "Identifier";
  name: string;
}

export interface NumericLiteral extends BaseNode {
  type: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends BaseNode {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral extends BaseNode {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NullLiteral extends BaseNode {
  type: "NullLiteral";
}

export interface ArrayExpression extends BaseNode {
  type: "ArrayExpression";
  elements: Expression[];
}

export interface AssignmentExpression extends BaseNode {
  type: "AssignmentExpression";
  operator: "=" | "+=" | "-=" | "*=" | "/=";
  target: Expression;
  value: Expression;
}

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  operator: "+" | "-" | "*" | "/" | "%" | "**" | "==" | "!=" | "<" | "<=" | ">" | ">=";
  left: Expression;
  right: Expression;
}

export interface LogicalExpression extends BaseNode {
  type: "LogicalExpression";
  operator: "&&" | "||";
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: "!" | "-";
  argument: Expression;
}

export interface UpdateExpression extends BaseNode {
  type: "UpdateExpression";
  operator: "++" | "--";
  argument: Expression;
  prefix: boolean;
}

export interface ConditionalExpression extends BaseNode {
  type: "ConditionalExpression";
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: Expression;
  args: Expression[];
}

export interface MemberExpression extends BaseNode {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean; // arr[0] vs obj.field
}

export interface ThisExpression extends BaseNode {
  type: "ThisExpression";
}

export interface NewExpression extends BaseNode {
  type: "NewExpression";
  callee: string;
  args: Expression[];
}

