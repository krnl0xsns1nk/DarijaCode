<div align="center">

# 🕊️ DarijaCode

**A programming language, runtime, and toolchain built from Moroccan Darija — from scratch, for fun.**

[![Status](https://img.shields.io/badge/status-early%20%2F%20experimental-orange.svg)](#current-status)
[![Made with TypeScript](https://img.shields.io/badge/made%20with-TypeScript-3178c6.svg)](#for-developers)

</div>

---

DarijaCode isn't just a toy compiler. The goal is a full language ecosystem — lexer, parser, type checker, native code generation, and eventually its own runtime and package manager — built the way Node.js's ecosystem grew, except every keyword speaks Darija instead of English.

This README has two doors in. Pick the one that fits you:

- 👋 **[I'm not a programmer / just curious](#-for-everyone)** — what this is, in plain language.
- 🛠️ **[I write code / want to contribute](#-for-developers)** — architecture, internals, current status.

---

## 👋 For Everyone

### What is this, really?

Imagine `print("Hello")` in Python. Now imagine writing that in your own language, with words that already make sense to you:

```darijacode
kteb("Salam!")
```

`kteb` means "write." That's it. That's the whole idea: programming concepts (store a value, repeat something, make a decision) shouldn't be blocked behind memorizing English words like `print`, `while`, or `function` before you even understand what they *do*.

### A quick side-by-side

| What you want to do | Python | DarijaCode |
|---|---|---|
| Store a value | `age = 20` | `dir age = 20` |
| Print something | `print("hi")` | `kteb("hi")` |
| Make a decision | `if age >= 18:` | `ila (age >= 18) { }` |
| Repeat something | `while i < 10:` | `mahd (i < 10) { }` |

The concepts are identical to any other language you've seen — a value, a decision, a loop. Only the *words* changed.

### Why does this exist?

No grand mission here — this is a for-fun, from-scratch project. Nobody's trying to replace Python or JavaScript. It's an exploration of a genuinely interesting question: *how much of the "learning to code" struggle is really about logic, and how much is just fighting unfamiliar English syntax?* And honestly, it's also just a fun excuse to build a compiler and a mini "Node.js" from the ground up.

### Current status

DarijaCode is **early and experimental**. The core pipeline (turning `.drj` source files into a real native binary) works for a solid subset of the language — variables, functions, `if`/`while`/`for` loops, and printing. Bigger pieces like classes, a standard library, and a package manager are still ahead. Think "exciting hobby project you can already run," not "production-ready language."

### How do I try it?

```bash
git clone https://github.com/krnl0xsns1nk/DarijaCode.git
cd DarijaCode
npm install
npm run dev <file.drj>
```

##### furur :
From there you can point the CLI at a `.drj` file once the `cli/` commands land (see [Roadmap](#roadmap)). If you just want to see the language, skim the [keyword reference](#language-quick-reference) below.

---

## 🛠️ For Developers

### The pitch

DarijaCode is a **compiled language**: source goes through a real frontend (lexer → parser → type checker) and a real backend (C code generation → `clang`/`gcc` → native binary). It's not an interpreter wrapping JS `eval`, and it's not a toy AST-walker — it's the same shape of pipeline you'd find in a "serious" compiler, scoped down to a small, honest core.

The long-term ambition (runtime, module system, package manager, bundler) is scaffolded in the project structure below, but only what's listed as ✅ actually works today. Nothing here is oversold.

### Architecture

```
Source (.drj)
    │
    ▼
 Lexer  ──────▶  Tokens
    │
    ▼
 Parser ──────▶  AST
    │
    ▼
 Checker ─────▶  validated AST (scoping, types, break/continue/return rules)
    │
    ▼
 Codegen ─────▶  C source
    │
    ▼
 clang / gcc ─▶  native binary
```

Every stage stops at the **first** error it finds and reports it with a source-frame (`@babel/code-frame`) in the style described in `about.md`'s error philosophy: what happened, where, and — where possible — how to fix it.

### Project structure

```
DarijaCode/
├── compiler/          the pipeline described above
│   ├── index.ts        — public API
│   ├── compiler.ts      — orchestrates lexer→parser→checker→codegen→cc
│   ├── lexer.ts, tokens.ts
│   ├── parser.ts, ast.ts
│   ├── checker.ts
│   ├── codegen.ts
│   └── errors.ts        — shared DarijaCodeError + formatting
├── cli/                 not started — commands like `darijacode run`
├── runtime/             not started — for the interpreted/dynamic path
├── modules/, packages/  not started — import/export resolution, package installs
├── bundler/, updater/   not started
└── project/             not started — `darijacode create`/`init`
```

### Implementation status

| Feature | Lexed | Parsed | Checked | Codegen |
|---|:---:|:---:|:---:|:---:|
| `dir` / `khli` (variables) | ✅ | ✅ | ✅ | ✅ |
| `fn` / `raj3` (functions) | ✅ | ✅ | ✅ | ✅ |
| `ila` / `awla` / `wla` (if/else if/else) | ✅ | ✅ | ✅ | ✅ |
| `mahd` (while) | ✅ | ✅ | ✅ | ✅ |
| `dwr` (C-style for) | ✅ | ✅ | ✅ | ✅ |
| `dwr (x in arr)` / for-of | ❌ | ❌ | ❌ | ❌ |
| `qta3` / `kml` (break/continue) | ✅ | ✅ | ✅ | ✅ |
| `kteb` (print) | ✅ | ✅ | ✅ | ✅ |
| Arrays | ✅ | ✅ | ✅ | ⚠️ literal-init only |
| Classes / `this` / `jdid` | ❌ | ❌ | ❌ | ❌ |
| Compound assignment (`+=` etc.) | ❌ | ❌ | ❌ | ❌ |
| Modules (`sadr`/`jib`) | ❌ | ❌ | ❌ | ❌ |
| Stdlib (`toul`, `zid`, `qlb`, ...) | — | — | ❌ not registered | ❌ |

### A key design tension, and how it's currently handled

DarijaCode is meant to be **dynamic by default**:

```darijacode
dir age = 20
age = "twenty"   // allowed — no type annotation was given
```

but **strict when asked**:

```darijacode
dir age: ra9m = 20
age = "twenty"   // error — annotation locks the type
```

`checker.ts` implements this correctly today: an unannotated `dir` stays untyped in the symbol table, so retyping it later is legal; an annotated one is locked and enforced.

`codegen.ts`, however, targets native C, and C doesn't have a "value that can be any type" without a tagged union. Right now, **codegen compiles the statically-typed subset only** — every variable gets a fixed C type inferred from its initializer, whether or not it has an annotation. A variable that genuinely changes type across its lifetime will pass the checker but fail to generate correct C. Closing that gap means introducing a small tagged runtime value (`DjValue`) for genuinely dynamic variables — a real runtime feature, not a quick patch, and deliberately not rushed.

### Language quick reference

| Concept | Keyword | Concept | Keyword |
|---|---|---|---|
| Variable | `dir` | Break | `qta3` |
| Constant | `khli` | Continue | `kml` |
| Function | `fn` | Class | `class` |
| Return | `raj3` | Constructor | `dirFlblasa` |
| If / else if / else | `ila` / `awla` / `wla` | Export / import | `sadr` / `jib` |
| While | `mahd` | Type alias | `naw3` |
| For | `dwr` | Print | `kteb` |

Full reference lives in `code.md`.

### Error philosophy in practice

```
DarijaCode Error:
1 | dir age: ra9m = "twenty"
              ^
twa93n ra9m, wlkin l9ina string
```

Errors carry a stage (`lexer` / `parser` / `checker` / `codegen`), a location, and — where it makes sense — a fix suggestion. See `errors.ts`.

### Dev setup

```bash
npm install
npm run build     # tsc
npm run dev        # ts-node src/compiler/index.ts
npm test           # node --test
```

Requires `clang` or `gcc` on your `PATH` for actually producing binaries — the frontend (lex/parse/check) runs without either.

### Roadmap

1. Unify error types fully (`CodegenError` → `DarijaCodeError`, mirroring the `checker.ts` swap already done).
2. `cli/` — `darijacode run file.drj`, `darijacode build file.drj`.
3. Standard library (`toul`, `zid`, `qlb`, math functions) registered in the checker and implemented in codegen/runtime.
4. Classes: add `THIS`/`JDID` tokens, then thread them through parser → checker → codegen.
5. `DjValue` tagged runtime value, to make dynamic `dir` fully real in generated code.
6. Modules, then packages, then project scaffolding tools — in that order, per `structure.md`.

### Contributing

Issues and PRs are welcome — this is a hobby project, so "welcome" means genuinely low-pressure. Keep files under ~500 lines (300 preferred), one responsibility per file, and match the existing incremental style: small, correct, and honest about what isn't done yet beats a big feature that's half-faked.

### License

DCL — see `LICENSE`.


