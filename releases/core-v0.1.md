# DarijaCode Core v0.1

The first public core release of DarijaCode.

DarijaCode is an independent programming language written in Rust. It has its own compiler, bytecode format, and virtual machine instead of relying on JavaScript, Python, Node.js, or another language to execute programs.

This release establishes the foundation of the DarijaCode core.

## What's included

- Lexer
- Parser
- AST
- Bytecode compiler
- Custom virtual machine
- `Kteb` statement
- `.drj` source files
- Standalone `drj` executable
- Basic command-line interface
- Cross-platform binaries

## Hello World

```drj
Kteb("wafin, al3alam!")
```

Run a DarijaCode program with:

```bash
drj program.drj
```

## Architecture

DarijaCode currently follows this pipeline:

```text
DarijaCode source
       ↓
     Lexer
       ↓
     Parser
       ↓
      AST
       ↓
 Bytecode Compiler
       ↓
   DarijaCode VM
       ↓
    Execution
```

The compiler and virtual machine are written in Rust.

The goal is to keep the language independent from the implementation language. Rust is used to build DarijaCode, but DarijaCode programs do not depend on Rust, Node.js, Python, or another external language runtime.

## Supported platforms

This release provides binaries for:

- Linux x86_64
- Linux ARM64
- macOS x86_64
- macOS ARM64
- Windows x86_64
- Windows ARM64
- Android ARM64
- Android ARMv7

## Installing

The easiest way to install DarijaCode is with the official installer (linux/macos/termux):

```bash
curl -fsSL https://raw.githubusercontent.com/krnl0xsns1nk/DarijaCode/master/installer.sh | bash
```

The installer detects your operating system and CPU architecture, downloads the appropriate binary from the latest GitHub release, and installs it as `drj`.

After installation:

```bash
drj
```

You should see the DarijaCode command-line help.

You can then run a program with:

```bash
drj program.drj
```

Pre-built binaries are also available directly from the GitHub release assets.

## Early development release

`core-v0.1` is an early development release.

DarijaCode is still a young language, and its syntax, bytecode format, compiler internals, virtual machine, and command-line interface may change in future releases.

This release is primarily about establishing the core architecture and making the language executable across multiple platforms.

## What's next

The next core releases will focus on expanding the language itself.

Planned areas include:

- Variables
- Types
- Constants
- Dynamic values
- Expressions
- Operators
- String interpolation
- Control flow
- Functions
- A larger standard library

## Philosophy

DarijaCode is not intended to be another programming-language tutorial or educational wrapper around an existing language.

The goal is to build a real, independent programming language.

The project is written in Rust because Rust is a good tool for building the compiler and runtime. But the language itself is its own thing.

No Node.js runtime.
No Python runtime.
No generated JavaScript.
No dependency on another programming language to execute DarijaCode programs.

Just a programming language, a compiler, bytecode, and a VM.

And yes, we're building it for fun.

## Open source

DarijaCode is open source and licensed under the GNU Affero General Public License v3.0.

You can use it, experiment with it, build projects with it, fork it, modify it, or contribute to it.

If people actually end up building real software with DarijaCode, that's exactly what we want to see.

## Documentation

The documentation is being developed separately.

For now, it is under developed:

## Contributing

DarijaCode is still small and actively evolving. Contributions, ideas, bug reports, experiments, and improvements are welcome.

See the repository's `CONTRIBUTING.md` for contribution guidelines.

---

Released as part of the DarijaCode Core series.

**core-v0.1 — the beginning of the real thing.**
