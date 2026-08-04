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

Philosophy (short)
- Build a language people in Morocco can learn quickly — use Darija in keywords, messages, and docs where possible.
- Produce native binaries (compiled to machine code) so programs are independent and fast.
- Keep the project simple: each file should do one job; make small, focused changes; prefer many small PRs over one big change.
- Make the repository C-ready so contributors don’t have to install or rely on Node/TypeScript just to help.
- Encourage beginner contributions: tasks range from docs and CLI improvements to small parser fixes and examples.

The strict rules (read this first)
See red_rules.md for the core constraints we follow:
- Compiled to binary.
- Independent runtime (no dependency on another language to run).
- User-visible things (error messages, keywords, examples) should use Darija where possible.
- The language must have its own ecosystem.

What’s in this repository (important paths)
- examples/ — small .drj example programs (print, read, touch).
- DEVLOPPER.md — developer instructions and step-by-step build/run notes.
- CONTRIBUTING.md — contribution guidelines tuned for the C rewrite.
- LICENSE — DarijaCode Community License (DCL) v2.0.
- docs/RED_RULES.md — the project’s core rules and constraints.

Quick start (minimum steps)
(Unix-like environment recommended: Linux or macOS. Windows: use WSL or adapt commands.)

1. Clone and switch to the rewrite branch:

```bash
   git clone https://github.com/krnl0xsns1nk/DarijaCode.git
   cd DarijaCode
   git fetch origin
   git checkout rewrite/c-frontend
```

2. Read the project rules and developer notes:
   less red_rules.md
   less devlopper.md
   less CONTRIBUTING.md

If you hit build issues, read devlopper.md for troubleshooting and environment notes (sanitizers, compilers, etc.).

What work we want (high-level)
- Keep changes small and focused: one change = one PR, one file = one job.
- Make the repo truly C-native: move parser/AST/sema/codegen into clear C modules (lexer.c, parser.c, ast.c, codegen.c, arena.c).
- Improve CLI ergonomics and developer documentation (devlopper.md).
- Add beginner tasks: simple examples in examples/, small refactors, documentation, tests that compile examples and assert stdout.
- Keep user-facing strings in Darija where possible (error messages, CLI help, examples).

Contributor expectations
- Basic C knowledge expected for code contributions. Beginners are welcome — you can still help with docs, examples, tests, and small cleanups.
- Read CONTRIBUTING.md before opening PRs. Follow the “one change per PR” rule and provide testing steps.
- By contributing you agree to license your contributions under DCL v2.0 (see LICENSE).

Testing and CI
- Minimal tests are example-driven: compile example -> run -> assert output.
- The rewrite branch aims to be test-light at first (to make C onboarding simple); tests will be reintroduced incrementally.

Community & governance
- See LICENSE for the community stewardship / maintainer inactivity rule: if the maintainer is inactive for six months, the community is permitted to continue the project as a clearly labeled community fork.
- Open issues for questions, design proposals, or “I want a starter task” requests.
- For documentation/website contributions, use: https://github.com/krnl0xsns1nk/DarijaCode-website

Notes and next actions
- If you are new to C, start with a tiny change: fix a typo in an example or improve a CLI message. Open a small PR and we’ll review.
- If you are comfortable in C, pick a small module to split (one function per module) and send a focused PR.
- Keep user-facing content in Darija where helpful; we will review translations and consistency.

Links and resources
- [docs/RED_RULES.md](./docs/RED_RULES.md) — project rules and constraints
- [DEVLOPPER.md](./DEVLOPPER.md) — step-by-step developer instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute to the rewrite
- [LICENSE](./LICENSE) — DCL v2.0 (project license)

Thank you for contributing
DarijaCode is a community effort — small, careful steps make a safer, simpler language for learners and developers in Morocco. If you’re unsure where to start, open an issue titled “starter task request” and tell us your skill level; a maintainer will assign a small first issue.
