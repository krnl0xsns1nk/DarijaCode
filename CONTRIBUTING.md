# Contributing to drj

Thank you for your interest in drj.

drj is an independent programming language written in Rust. The project is experimental, open source, and built primarily because we want to build a real programming language and see where it can go.

The project is still young, so the compiler, bytecode format, VM, standard library, tooling, and language syntax may change. Contributions are welcome, whether you're fixing a bug, improving the compiler, writing documentation, adding tests, or experimenting with the language itself.

Before you start

Please read:

- [README.md](./README.md) — project overview and current architecture.
- [DEVELOPER.md](./DEVELOPER.md) — development and build instructions.
- [LICENSE](./LICENSE) — GNU Affero General Public License v3.0.

Before starting significant work, check existing issues and pull requests. For larger changes, opening an issue first is a good way to discuss the idea before spending time implementing it.

## Getting the source

Fork the repository, clone your fork, and create a branch:

```
git clone https://github.com/krnl0xsns1nk/drj.git
cd drj
git checkout -b feature/<short-description>
```

For example:

```
feature/functions
feature/bytecode-optimizer
fix/parser-error
fix/vm-stack
docs/update-installation
```

Keep branch names short and descriptive.

# Development environment

drj is written in Rust and uses Cargo.

You will generally need:

- Rust
- "rustc"
- "cargo"
- Git

Install Rust from [rustup.rs](https://rustup.rs/) if it is not already installed.

Build the project with:

```
cargo build
```


Run drj with:

```
cargo run -- path/to/program.drj
```


For release builds:

```
cargo build --release
```


The exact development workflow may evolve as the compiler and VM grow, so check "DEVELOPER.md" when working on compiler internals.

Understanding the project

drj is not a language implemented as a thin layer over JavaScript, Python, Node.js, or another existing programming language.

The goal is to build an actual language implementation.

At a high level, the toolchain currently looks like:

```
drj source
      │
      ▼
    Lexer
      │
      ▼
    Parser
      │
      ▼
     AST
      │
      ▼
Bytecode Compiler
      │
      ▼
drj Bytecode
      │
      ▼
Custom Virtual Machine
      │
      ▼
   Program
```


Rust is used to implement the compiler and runtime.

The bytecode format and VM are part of drj itself. They are implementation details that will evolve as the project develops.

When contributing, keep this independence in mind. Avoid introducing dependencies on another language's runtime or compiler when the functionality belongs inside drj itself.

What can you contribute?

There is no single "correct" type of contribution.

### Some areas include:

- Lexer improvements
- Parser improvements
- AST design
- Semantic analysis
- Bytecode generation
- Virtual machine implementation
- Runtime features
- Error reporting
- CLI improvements
- Standard library development
- Compiler optimizations
- Tests
- Documentation
- Examples
- Developer tooling
- Editor support
- Build and release tooling

You can also propose something completely different. Open an issue and explain what you want to build.

## Language and implementation changes

drj is still evolving, so language design decisions should be discussed before large changes are implemented.

For changes involving syntax, semantics, bytecode, the VM, or the standard library, explain:

1. What problem the change solves.
2. What the proposed behavior is.
3. Why the change belongs in drj.
4. Whether it introduces breaking changes.
5. How the behavior can be tested.

Do not assume that an existing implementation detail is permanent. The project is still being designed.

Coding style

For Rust code:

```
cargo fmt
cargo clippy
```

Follow normal Rust conventions.

In particular:

- Use "snake_case" for functions and variables.
- Use "CamelCase" for types.
- Keep modules focused.
- Avoid unnecessarily large files and functions.
- Prefer clear code over clever code.
- Keep comments useful and concise.
- Use English for code comments and internal implementation documentation.

For user-facing language features, follow the project's current Darija terminology and syntax.

### Tests

Changes to compiler behavior should ideally include tests.

Depending on the feature, this may mean:

- Lexer tests
- Parser tests
- AST tests
- Bytecode tests
- VM tests
- Error tests
- ".drj" integration tests
- CLI tests

At minimum, manually verify that the affected behavior works before opening a pull request.

Run the project's test suite with:

```
cargo test
```

And make sure the project still builds:

```
cargo build
```

Commit messages

Keep commit messages short and descriptive.

Examples:

```
feat: add function declarations
fix: handle empty string literals
fix: correct VM stack cleanup
refactor: simplify bytecode emitter
docs: update installation instructions
test: add parser tests for if statements
build: update release workflow
```


If your commit fixes an issue, reference it where appropriate:

```
fix: handle invalid function calls
Fixes #123
```

### Pull requests

Push your branch to your fork:

git push origin feature/<short-description>

Then open a pull request against the repository's default branch.

A good pull request should explain:

- What changed.
- Why it changed.
- How it was implemented.
- How you tested it.
- Any breaking changes or compatibility concerns.

For example:

## What changed

Added support for function declarations and calls.

## Why

drj currently supports basic statements but cannot define reusable functions.

## Testing

```
cargo fmt --check
cargo test
cargo build
```

Also tested:

```
cargo run -- examples/functions.drj
```

Keep pull requests focused. A small, understandable PR is easier to review and merge than a large collection of unrelated changes.

Issues

Issues are useful for:

- Bug reports
- Feature requests
- Language design discussions
- Compiler problems
- VM problems
- Documentation problems
- Build or release problems

For bug reports, include:

- Operating system
- Architecture
- Rust version
- drj version or commit
- The ".drj" program that reproduces the problem
- The command you ran
- Expected behavior
- Actual behavior
- Relevant error output

A minimal reproducer is extremely helpful.

## License

drj is free and open-source software licensed under the:

GNU Affero General Public License v3.0 (AGPL-3.0).

By contributing to drj, you agree that your contribution will be distributed under the project's applicable licensing terms.

Please read [LICENSE](./LICENSE) before contributing.

Do not submit code copied from another project unless its license is compatible with AGPL-3.0 and the origin and license are properly documented.

Code of conduct

Be respectful.

Technical disagreements are normal, especially when designing a programming language. Discuss the implementation, design, and trade-offs rather than attacking people.

Harassment, discrimination, personal attacks, and abusive behavior are not acceptable.

The project is experimental

drj is intentionally experimental.

The syntax may change.

The compiler may change.

The bytecode may change.

The VM may change.

APIs may change.

Some ideas will work. Some will turn out to be terrible. That is part of building a programming language.

Don't be afraid to experiment, but document important design decisions and keep changes understandable.

## Questions

If you want to work on something but are not sure where to start, open an issue and describe what you want to build.

If you already know what you're doing, you can simply pick an area of the compiler, VM, tooling, documentation, or language and start exploring the code.

For language usage and user-facing documentation, see the drj documentation site:

#### Documentation: [doc repo](https://github.com/krnl0xsns1nk/drj-website)

---

drj is being built for the fun of building a real programming language.

If you want to help make it better, you're welcome here.
