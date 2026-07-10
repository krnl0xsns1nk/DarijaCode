# DarijaCode Project Architecture

## Main Goal

DarijaCode is a programming language written in TypeScript.

Pipeline:

Source (.drj)
    |
    v
Lexer
    |
    v
Tokens
    |
    v
Parser
    |
    v
AST
    |
    +----------------+
    |                |
    v                v
Runtime          Code Generator
    |                |
    v                v
Execute          C / Native Binary


---

# Project Structure

DarijaCode/

├── src/
│
│── cli/
│   ├── index.ts
│   ├── commands.ts
│   ├── flags.ts
│   └── help.ts
│
│
├── frontend/
│   │
│   ├── lexer/
│   │   ├── lexer.ts
│   │   ├── scanner.ts
│   │   └── characters.ts
│   │
│   ├── tokens/
│   │   ├── token.ts
│   │   ├── tokenTypes.ts
│   │   └── keywords.ts
│   │
│   ├── parser/
│   │   ├── parser.ts
│   │   ├── statements.ts
│   │   ├── expressions.ts
│   │   └── grammar.ts
│   │
│   └── ast/
│       ├── nodes.ts
│       ├── expressions.ts
│       └── statements.ts
│
│
├── core/
│   │
│   ├── types/
│   │   ├── types.ts
│   │   ├── checker.ts
│   │   └── inference.ts
│   │
│   ├── values/
│   │   ├── value.ts
│   │   └── primitives.ts
│   │
│   └── language/
│       ├── constants.ts
│       └── rules.ts
│
│
├── runtime/
│   │
│   ├── interpreter.ts
│   ├── environment.ts
│   ├── memory.ts
│   ├── functions.ts
│   ├── objects.ts
│   └── native/
│       ├── print.ts
│       ├── math.ts
│       └── system.ts
│
│
├── compiler/
│   │
│   ├── codegen/
│   │   ├── generator.ts
│   │   ├── cGenerator.ts
│   │   └── templates.ts
│   │
│   ├── build/
│   │   ├── compiler.ts
│   │   └── linker.ts
│   │
│   └── output/
│       └── manager.ts
│
│
├── modules/
│   │
│   ├── resolver.ts
│   ├── loader.ts
│   ├── exports.ts
│   └── imports.ts
│
│
├── packages/
│   │
│   ├── manager.ts
│   ├── registry.ts
│   ├── installer.ts
│   └── packageFile.ts
│
│
├── project/
│   │
│   ├── creator.ts
│   ├── config.ts
│   ├── structure.ts
│   └── updater.ts
│
│
├── validation/
│   │
│   ├── validator.ts
│   ├── syntax.ts
│   ├── types.ts
│   └── security.ts
│
│
├── errors/
│   │
│   ├── error.ts
│   ├── compilerError.ts
│   ├── runtimeError.ts
│   └── formatter.ts
│
│
├── updater/
│   │
│   ├── updater.ts
│   ├── version.ts
│   └── migration.ts
│
│
├── bundler/
│   │
│   ├── combainer.ts
│   ├── dependencyGraph.ts
│   └── bundle.ts
│
│
├── utils/
│   │
│   ├── filesystem.ts
│   ├── logger.ts
│   └── paths.ts
│
│
└── index.ts


---

# File Responsibility Rules

## Maximum file size

No file should exceed:

500 lines

Preferred:

100-300 lines


If a file becomes large:

Split by responsibility.

Example:

Bad:

parser.ts
(2000 lines)

Good:

parser.ts
statements.ts
expressions.ts
functions.ts


---

# Folder Responsibilities


## frontend/

Everything that understands user code.

Example:

Input:

kteb("hello")

Output:

AST


---

## core/

Language logic.

Example:

What is a number?

What is a string?

How does type checking work?


---

## runtime/

Actually executes programs.

Example:

dir age = 20

Runtime stores:

age -> 20


---

## compiler/

Creates executable programs.

Example:

AST -> C -> binary


---

## modules/

Handles:

import

export

module resolution


Example:

import math


---

## packages/

Handles external packages.

Commands:

darijacode install package


Responsible for:

- downloading packages
- versions
- dependencies


---

## project/

Handles projects.

Commands:

darijacode create

darijacode init


Responsible for:

- project files
- configuration
- structure


---

## validation/

Checks programs before execution.

Examples:

- syntax mistakes
- invalid types
- unsafe operations


---

## errors/

Every error shown to users.

Responsible for:

Example:

DarijaCode Error:

line 5 column 10

expected ")"

---

## updater/

Allows safe updates.

Responsible for:

- version migration
- updating projects
- compatibility


---

## bundler/

Combines:

- source files
- modules
- packages

Before building.


---

# CLI Commands

Future:

darijacode run file.drj

darijacode build file.drj

darijacode install package

darijacode create project

darijacode update

darijacode help


---

# Development Order

Do NOT build everything immediately.

Recommended order:

Phase 1:
frontend
- lexer
- tokens
- parser
- AST


Phase 2:
runtime
- variables
- print
- functions


Phase 3:
compiler
- code generation


Phase 4:
modules


Phase 5:
packages


Phase 6:
project tools


Phase 7:
updater/security


---

# Architecture Principle

Every part should have one responsibility.

Lexer does not parse.

Parser does not execute.

Runtime does not generate C.

Compiler does not manage packages.

CLI only connects everything together.
