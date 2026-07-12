# Developing DarijaCode

This is the technical companion to the README. The README explains what
DarijaCode *is*; this explains how it's *built*, so you can work on it
without reverse-engineering the code first.

## Table of Contents

- [Setup](#setup)
- [Project structure](#project-structure)
- [The pipeline, end to end](#the-pipeline-end-to-end)
- [Coding conventions](#coding-conventions)
- [Walkthrough: adding a new keyword](#walkthrough-adding-a-new-keyword)
- [Current known gaps](#current-known-gaps)
- [Submitting changes](#submitting-changes)

---

## Setup

You need:

- **Node.js** (see `devDependencies` in `package.json` for the TypeScript/
  ts-node versions this targets)
- **`clang` or `gcc`** on your `PATH` — required for `compiler.ts` to
  produce a binary. The frontend (lexer/parser/checker) runs fine without
  either, so you can work on those stages without a C toolchain installed.

```bash
git clone https://github.com/krnl0xsns1nk/DarijaCode.git
cd DarijaCode
npm install

npm run build   # tsc -> dist/
npm run dev     # ts-node src/compiler/index.ts, for iterating without a build step
npm test        # node --test
```

---

## Project structure

```
DarijaCode/
├── compiler/          the working pipeline — see below
│   ├── index.ts         public API, re-exports everything
│   ├── compiler.ts       orchestrates the full pipeline + invokes cc
│   ├── tokens.ts          TokenType enum + Token shape
│   ├── lexer.ts           source string -> Token[]
│   ├── ast.ts             every AST node type
│   ├── parser.ts          Token[] -> AST (recursive descent)
│   ├── checker.ts         AST -> validated AST (scoping, types, errors)
│   ├── codegen.ts         AST -> C source string
│   └── errors.ts          DarijaCodeError + formatError() (code frames)
├── cli/                not started
├── runtime/             not started (for a future interpreted/dynamic path)
├── modules/, packages/  not started
├── bundler/, updater/   not started
└── project/             not started (`darijacode create`/`init`)
```

**Rule of thumb for where new code goes:** if it understands or
transforms `.drj` source, it belongs in `compiler/`. Everything else
(CLI UX, package installs, project scaffolding) gets its own top-level
folder, per `structure.md`, and hasn't been started yet.

---

## The pipeline, end to end

```
source.drj
    │  Lexer.tokenize()
    ▼
Token[]
    │  Parser.parse()
    ▼
AST (Program)
    │  Checker.check()          — throws DarijaCodeError on the first problem
    ▼
validated AST
    │  Codegen.generate()
    ▼
C source string
    │  clang/gcc (via compiler.ts's compileCFile)
    ▼
native binary
```

`compiler.ts`'s `compile()` function runs all of this and stops at the
first thrown error, formatting it with `errors.ts`'s `formatError()`
(source frame + message + hint, per `about.md`'s error philosophy).

A few things worth knowing before you touch any single stage:

- **`checker.ts` and `codegen.ts` both do their own type inference.**
  This is intentional duplication, not an oversight — they have
  different jobs. The checker's job is to *validate and reject* bad
  programs with a helpful error; it treats an untyped `dir` as
  legitimately dynamic (`UNKNOWN`) and lets it through. The codegen's
  job is to *emit working C*, which currently requires every variable to
  resolve to one concrete C type — so codegen infers a type from the
  initializer regardless of whether there's an annotation. A program can
  pass the checker and still fail codegen if it relies on true dynamic
  retyping. This is the biggest architectural debt in the project right
  now (see [Known Gaps](#current-known-gaps)).
- **Function signatures are hoisted** in both the checker and codegen, in
  a first pass over `program.body`, so forward references and recursion
  work regardless of declaration order in the source file.
- **Every AST node carries a `pos: { line, column }`.** Always pass this
  through to any error you throw — it's what makes the code-frame
  formatting in `errors.ts` possible. An error without a real position is
  a debugging dead end for whoever hits it.

---

## Coding conventions

These aren't arbitrary — they're what's kept this codebase readable
while several files (`parser.ts`, `checker.ts`, `codegen.ts`) each cover
a lot of ground.

- **File size:** aim for 100–300 lines, hard ceiling 500. If a file is
  growing past that, it's usually because it's doing two responsibilities
  — split it (e.g. `parser.ts` → `statements.ts` + `expressions.ts`, the
  way `structure.md` already lays out).
- **One responsibility per file.** The lexer does not parse. The parser
  does not check types. The checker does not generate code. If you find
  yourself importing `codegen.ts` into `checker.ts`, stop — that's a
  sign the boundary is being crossed.
- **No fake implementations.** If a feature isn't supported yet (classes,
  the stdlib, compound assignment), the code should throw a clear error
  naming the gap — never silently no-op or emit something that looks
  plausible but is wrong. Search this codebase for `is not supported yet`
  to see the pattern.
- **Reuse existing dependencies before adding new ones.** `@babel/code-frame`
  is already a dependency and is what powers `errors.ts`'s source frames —
  that's why it's used instead of a hand-rolled frame renderer. Check
  `package.json` before reaching for something new.
- **Incremental, not a rewrite.** If a fix touches 20 lines, don't rewrite
  500. This project has grown one working file at a time, each one
  consistent with what came before it — keep that going.

---

## Walkthrough: adding a new keyword

Say you want to add a new keyword — this is the full path it needs to
travel through the pipeline, using something like a hypothetical `ghyr`
("elif" as a synonym for `awla`) as a placeholder for whatever you're
actually adding:

1. **`tokens.ts`** — add a `TokenType` member for it.
2. **`lexer.ts`** — add an entry to the `keywords` record mapping the
   literal text to that `TokenType`.
3. **`ast.ts`** — add or extend whatever AST node(s) represent the new
   construct. If it's a new kind of statement or expression, add it to
   the `Statement`/`Expression` union too, or TypeScript won't force you
   to handle it everywhere it needs handling.
4. **`parser.ts`** — add a case in `statement()` (or wherever it belongs
   in the expression precedence chain) that consumes the new token and
   builds the AST node.
5. **`checker.ts`** — add a case in `checkStatement()` or `inferType()`
   for the new node type. Even a minimal check (e.g. "this exists, has
   valid children") is better than falling through to the `default:`
   branch, which will just say `'X' is not supported yet`.
6. **`codegen.ts`** — add a case in `genStatement()` or `genExpression()`
   to emit the corresponding C.
7. **`code.md`** — document the new keyword in the reference table.

The `default: throw new DarijaCodeError(...)` branches in `checker.ts`
and `codegen.ts` are your safety net here — if you forget step 5 or 6,
you'll get a clear "not supported yet" error instead of silently broken
output, rather than a confusing crash somewhere else.

---

## Current known gaps

Kept here so nobody re-discovers these the hard way, and so "is this
supposed to work?" has one place to check first.

| Gap | Where | Notes |
|---|---|---|
| Dynamic `dir` retyping doesn't codegen correctly | `codegen.ts` | Passes the checker, fails to produce correct C. Needs a tagged `DjValue` runtime type. |
| No CLI | `cli/` | `compile()` is only callable from Node right now. |
| No stdlib | `checker.ts` | Any call to `toul`, `zid`, `qlb`, etc. is currently "function not defined." |
| No classes | everywhere | `this`/`jdid` aren't even tokenized yet — needs tokens → lexer → parser → checker → codegen, in that order. |
| No `for...in` / `for...of` | `parser.ts` | Only the C-style `dwr (init; cond; update)` form is implemented — no `IN`/`OF` tokens exist yet. |
| No compound assignment | `lexer.ts` | `+=`, `-=`, etc. aren't tokenized — only `=`. |
| Arrays only work as a direct initializer | `codegen.ts` | `dir x: ra9m[] = [1,2,3]` works; arrays elsewhere throw. |

If you're picking up work, check this table first — it's more current
than any comment buried in a specific file.

---

## Submitting changes

- Keep PRs scoped to one thing. A PR that adds a keyword and refactors
  the parser's precedence chain at the same time is two PRs.
- If your change closes a row in the [Known Gaps](#current-known-gaps)
  table, update the table in the same PR.
- If your change affects the language itself (new keyword, changed
  syntax), update `code.md` in the same PR — the reference table drifting
  out of sync with the actual parser is the easiest way for this project
  to become confusing.
- Match the existing error style: throw `DarijaCodeError` with a real
  `line`/`column` from the node's `pos`, not a generic `Error`.

This is a for-fun, single-maintainer project (see `LICENSE.md` for what
happens if the maintainer goes quiet for a while) — contributions are
welcome, low-pressure, and appreciated.

