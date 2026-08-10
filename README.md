<div align="center">

# 🕊️ DarijaCode

A programming language and compiler written for fun, using Moroccan Darija.

[![Issues](https://img.shields.io/github/issues/krnl0xsns1nk/DarijaCode)](https://github.com/krnl0xsns1nk/DarijaCode/issues)
[![Last commit](https://img.shields.io/github/last-commit/krnl0xsns1nk/DarijaCode)](https://github.com/krnl0xsns1nk/DarijaCode/commits)
[![Top language](https://img.shields.io/github/languages/top/krnl0xsns1nk/DarijaCode)](https://github.com/krnl0xsns1nk/DarijaCode)
[![Languages count](https://img.shields.io/github/languages/count/krnl0xsns1nk/DarijaCode)](https://github.com/krnl0xsns1nk/DarijaCode)

[![License](https://img.shields.io/badge/license-DCL-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/krnl0xsns1nk/DarijaCode?style=social)](https://github.com/krnl0xsns1nk/DarijaCode)
[![Forks](https://img.shields.io/github/forks/krnl0xsns1nk/DarijaCode?style=social)](https://github.com/krnl0xsns1nk/DarijaCode/network/members)

</div>

## Philosophy (short)
- Build a language people in Morocco can learn quickly — use Darija in keywords, messages, and docs where possible.
- Run programs through DarijaCode's own bytecode VM, so there's no dependency on another language's toolchain to execute code.
- Keep the project simple: each file should do one job; make small, focused changes; prefer many small PRs over one big change.
- Make the repository Rust-ready so contributors can build and run the whole toolchain with just `cargo`.
- Encourage beginner contributions: tasks range from docs and CLI improvements to small parser fixes and examples.

## The strict rules (read this first)
See `docs/RED_RULES.md` for the core constraints we follow:
- The language runs on its own bytecode VM — no shelling out to another language's compiler to execute code.
- Independent runtime (no dependency on another language to run programs).
- User-visible things (error messages, keywords, examples) should use Darija where possible.
- The language must have its own ecosystem.

## What's in this repository (important paths)
- `examples/` — small `.drj` example programs (print, read, touch).
- `DEVELOPER.md` — developer instructions and step-by-step build/run notes.
- `CONTRIBUTING.md` — contribution guidelines tuned for the Rust rewrite.
- `LICENSE` — DarijaCode Community License (DCL) v2.0.
- `docs/RED_RULES.md` — the project's core rules and constraints.

## Architecture (current)
DarijaCode compiles source into bytecode, which runs on a stack-based virtual machine written in Rust:

```
source (.drj) → lexer → parser → AST → bytecode compiler → VM (executes bytecode)
```

This replaces the earlier approach of emitting C and shelling out to a C compiler. The VM owns execution end-to-end, which means:
- No external compiler toolchain is required to *run* a DarijaCode program.
- Rust's memory safety guarantees protect the interpreter loop itself.
- The bytecode format and VM are internal implementation details and may change as the project evolves.

## Quick start (minimum steps)
(Requires a recent stable [Rust toolchain](https://rustup.rs/) — `rustc` and `cargo`.)

1. Clone and switch to the rewrite branch:

```bash
git clone https://github.com/krnl0xsns1nk/DarijaCode.git
cd DarijaCode
git fetch origin
git checkout rewrite/rust-vm
```

2. Build and run:

```bash
cargo build
cargo run -- examples/hello.drj
```

3. Read the project rules and developer notes:

```bash
less docs/RED_RULES.md
less DEVELOPER.md
less CONTRIBUTING.md
```

If you hit build issues, read `DEVELOPER.md` for troubleshooting and environment notes (Rust version, cargo features, etc.).

## What work we want (high-level)
- Keep changes small and focused: one change = one PR, one file = one job.
- Keep the VM and compiler organized into clear Rust modules (`lexer.rs`, `parser.rs`, `ast.rs`, `bytecode.rs`, `vm.rs`).
- Improve CLI ergonomics and developer documentation (`DEVELOPER.md`).
- Add beginner tasks: simple examples in `examples/`, small refactors, documentation, tests that compile examples and assert stdout.
- Keep user-facing strings in Darija where possible (error messages, CLI help, examples).

## Contributor expectations
- Basic Rust knowledge expected for code contributions. Beginners are welcome — you can still help with docs, examples, tests, and small cleanups.
- Read `CONTRIBUTING.md` before opening PRs. Follow the "one change per PR" rule and provide testing steps.
- By contributing you agree to license your contributions under DCL v2.0 (see `LICENSE`).

## Testing and CI
- Minimal tests are example-driven: compile example → run on the VM → assert output.
- Standard Rust testing (`cargo test`) is used for unit tests on the lexer, parser, and VM as they stabilize.

## Community & governance
- See `LICENSE` for the community stewardship / maintainer inactivity rule: if the maintainer is inactive for six months, the community is permitted to continue the project as a clearly labeled community fork.
- Open issues for questions, design proposals, or "I want a starter task" requests.
- For documentation/website contributions, use: https://github.com/krnl0xsns1nk/DarijaCode-website

## Notes and next actions
- If you are new to Rust, start with a tiny change: fix a typo in an example or improve a CLI message. Open a small PR and we'll review.
- If you are comfortable in Rust, pick a small module to work on (lexer, parser, or VM) and send a focused PR.
- Keep user-facing content in Darija where helpful; we will review translations and consistency.

## Links and resources
- [docs/RED_RULES.md](./docs/RED_RULES.md) — project rules and constraints
- [DEVELOPER.md](./DEVELOPER.md) — step-by-step developer instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute to the rewrite
- [LICENSE](./LICENSE) — DCL v2.0 (project license)

## Thank you for contributing
DarijaCode is a community effort — small, careful steps make a safer, simpler language for learners and developers in Morocco. If you're unsure where to start, open an issue titled "starter task request" and tell us your skill level; a maintainer will assign a small first issue.

