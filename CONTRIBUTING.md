# Contributing to DarijaCode

Thank you for contributing to DarijaCode!

Requirements

- `Node.js 16+`
- A C compiler ("`clang`" or "`gcc`")
- `Git`

Clone the project
```bash
git clone https://github.com/krnl0xsns1nk/DarijaCode.git
cd DarijaCode
pnpm install
```
Build
```
npm run build
```
Or build and install the CLI globally:
```
npm run setup
```
### Running DarijaCode

Run a source file without building:
```
npm run dev example.drj
```
Compile and run:
```
npm run now -- example.drj
```
Use the CLI:
```
drj run example.drj
drj check example.drj
drj build example.drj
drj --help
```
Running Tests

Run every test:
```
npm test
```
Run a specific suite:
```
npm run test:lexer
npm run test:parser
npm run test:checker
npm run test:compiler
npm run test:runtime
npm run test:errors
```
Project Layout

src/
├── cli.ts
├── compiler/
│   ├── lexer.ts
│   ├── parser.ts
│   ├── checker/
│   ├── codegen/
│   ├── compiler.ts
│   ├── errors.ts
│   └── ast.ts
├── runtime/
└── utils/

tests/
├── lexer/
├── parser/
├── checker/
├── compiler/
├── runtime/
├── errors/
└── snapshots/

docs/
├── about.md
└── error_codes.md

Compiler Pipeline

Source (.drj)
      ↓
Lexer
      ↓
Parser
      ↓
Checker
      ↓
Code Generator
      ↓
C Compiler
      ↓
Executable

Before Opening a Pull Request

- Keep changes focused.
- Follow the existing code style.
- Add or update tests when behavior changes.
- Update documentation if you add a new language feature.
- Make sure "npm test" passes.

Thank you for helping improve DarijaCode!
