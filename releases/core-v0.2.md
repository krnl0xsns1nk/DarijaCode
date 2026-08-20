# drj core-v0.2

### Overview

"core-v0.2" turns DRJ from a basic language prototype into a small interpreted programming language with a complete compilation pipeline.

The core pipeline is now:

```
Source Code
    ↓
Lexer
    ↓
Parser
    ↓
AST
    ↓
Checker
    ↓
Code Generator
    ↓
Virtual Machine
    ↓
Program Output
```

### Language Features

#### Variables

Variables can be declared with an explicit type:

```drj
name: nss = "hello"
age: 3dd = 20
price: 3xr = ~10.5
enabled: mnt = sah
```

Variables can also use type inference with `:=`:

```drj
name := "hello"
age := 20
price := ~10.5
enabled := ah
```

#### Reassignment

Existing variables can be reassigned:

```drj
age := 20
age = 21
```

The checker verifies that the new value has the correct type.

#### Data Types

Currently supported:

| Type  | Meaning |
|-------|---------|
| `nss` | String  |
| `3dd` | Integer |
| `3xr` | Float   |
| `mnt` | Boolean |

#### Expressions

DRJ supports:

```drj
1 + 2
10 - 5
4 * 3
4 × 3
10 / 2
10 ÷ 2
```

Operator precedence works correctly:

```drj
1 + 2 * 3
```

is evaluated as:

```drj
1 + (2 * 3)
```

Parentheses can override precedence:

```drj
(1 + 2) * 3
```

#### Unary Expressions

Negative numbers and nested unary negation are supported:

```drj
-1
-(-10)
```

#### String Operations

Strings can be concatenated:

```drj
"hello" + "world"
```

Strings can be repeated:

```drj
"hello" * 3
```

DRJ also supports negative repetition. Negative repetition reverses the string before repeating it:

```drj
"abc" * -1
```

produces (makes sense "reversed"):

```
cba
```

And:

```drj
"abc" * -3
```

produces:

```
cbacbacba
```

because "abc" * -3 equal to "abc" * -1 * 3

#### Printing

Programs can print expressions:

```drj
kteb("hello world")
kteb(1 + 2 * 3)
```

### Type Checking

The checker verifies:

- Variable declarations
- Variable reassignment
- Unknown variables
- Expression types
- Binary operator compatibility
- Unary operator compatibility
- Declared types
- Inferred types

Examples:

```drj
name: nss = 10
```

produces a type error.

```drj
kteb(unknown)
```

produces an unknown variable error.

```drj
"hello" - 10
```

produces an invalid operator/type combination error.

### Source Spans

Expressions and identifiers preserve source location information. This allows errors to point to the relevant part of the source code.

Example:

```
---> program.drj:1:11
4alat[DCE15]: ...
  |
1 | n: 3dd = 10 / 3
  |          ^^^^^^
```

### Error System

Errors include:

- Error code
- Error title
- Additional information
- File name
- Line number
- Column number
- Source line
- Highlighted error span

Terminal output uses colors for improved readability.

### Code Generation

The AST is compiled into VM instructions.

Example:

```drj
n := 1 + 2 * 3
kteb(n)
```

can generate instructions conceptually similar to:

```
PushInt 1
PushInt 2
PushInt 3
Mul
Add
Store n
Load n
Print
```

### Virtual Machine

The DRJ virtual machine currently supports:

- Integer values
- Float values
- String values
- Boolean values
- Variables
- Arithmetic
- String concatenation
- String repetition
- Unary negation
- Printing

### Testing

The project includes automated tests for:

- Lexing
- Variable declarations
- Binary expressions
- Operator precedence
- Parentheses
- Identifiers in expressions
- Floats
- Strings
- Booleans
- Operators
- Invalid lexer input

The test suite is run with:

```sh
cargo test
```

### Known Limitations

"core-v0.2" is still a small language core.

The following are intentionally not part of this version:

- Functions
- Modules
- Imports
- Arrays
- Objects
- Loops
- Conditional statements
- User input
- Structs
- Classes
- Closures
- Garbage collection
- Native code generation
- JIT compilation
- Full compile-time constant evaluation

Some runtime errors cannot be detected by the current type checker.

For example:

```drj
n := 0
x := 10 / n
```

requires runtime protection because the current checker tracks types but does not perform full value analysis.

### core-v0.2 Goal

The goal of "core-v0.2" was to establish a solid foundation for DRJ:

```
Parse correctly
    ↓
Build a structured AST
    ↓
Validate programs
    ↓
Generate instructions
    ↓
Execute programs safely
```

This version establishes the core architecture that future versions will build upon.

---

## Next: core-v0.3

The next major stage is expected to focus on control flow.

Possible direction:

```
better checker
    ↓
Comparisons
    ↓
Boolean expressions
    ↓
Conditional branching
```

The exact scope of "core-v0.3" will be decided after later... 

