# Contributing to DarijaCode

Thanks for wanting to contribute — welcome! This document explains how to get started, how to make and submit changes, and the project's expectations for contributions.

Short summary
- All contributions are licensed under the DarijaCode Community License (DCL) v2.0 (see [LICENSE](./LICENSE)).
- Be respectful and collaborative. We expect constructive, civil behavior.
- Follow the steps below to propose changes (bug fixes, features, docs, tests, etc.).

1) Before you start
- Read the LICENSE and this CONTRIBUTING.md.
- Search existing issues and PRs to avoid duplicate work.

2) Get the source locally
Fork the repository on GitHub, then clone your fork and switch to a working branch:
```
git clone https://github.com/krnl0xsns1nk/DarijaCode.git
cd DarijaCode
git checkout -b feature/<short-description>
```
Branch naming examples:
- feature/add-parser
- fix/print-newline
- docs/update-readme
- rewrite/c-frontend

3) Development environment
- C toolchain: gcc or clang, make, ar
- (Optional but recommended) clang with sanitizers for runtime debugging
- for how to run and work with the project see [Devlopper](./DEVLOPPER.md) file

4) or if you ar complitly biggner :
- nothing, just an editor to write documentations for the project and the will be useful for us

<!-- test section will be added soon -->

5) Coding style & guidelines
- Keep code readable and well-commented.
- Use UTF-8 text encoding.
- Keep function names and identifiers consistent with existing code (see src/).
- separte the files so every single file has one specific job

6) Commit messages
- Use present-tense, short subject lines, with details in the body if needed:
  fix: correct dj_print handling for empty strings
  feat: add new AST node for ObjectExpression
- If related to an issue, reference it in the commit/PR (e.g., Fixes #123).

7) Making a pull request
1. Push your branch to your fork:
   git push origin feature/<short-description>
2. Open a PR against the repository default branch (explain the change, motivation, and testing steps).
3. Include:
   - What you changed.
   - How to run tests / build.
   - Any migration or compatibility notes.
4. Assign reviewers / request review from maintainers or contributors.
5. Address feedback in follow-up commits on the same branch.

8) Issues
- When filing an issue, include:
  - A short title.
  - A clear description of the problem or requested feature.
  - Steps to reproduce (for bugs), environment (OS/toolchain versions), and expected vs actual results.
  - Minimal reproducer if possible (a small .drj file, commands you ran, and relevant output).

9) Pull request review criteria
- Does it build locally?
- Are new behaviors covered by tests or a clear manual test plan?
- Is the code style consistent and clear?
- Does it preserve backwards compatibility, or clearly document breaking changes?
- Is attribution and license preserved where applicable?

10) Contributor expectations and legal
- By contributing, you agree your contribution will be made available under the DCL v2.0 license (see LICENSE).
- Don't submit third-party code unless its license is compatible and you clearly indicate its origin.

11) Code of conduct
- Treat others with respect. Harassment, personal attacks, or other abusive conduct will not be tolerated.
- If you experience or witness problems, open an issue or contact the maintainer.

12) Maintainer inactivity & community stewardship
- See LICENSE §5 for the inactivity policy. If the maintainer is inactive, the community may continue the project as a community fork, but must follow attribution and naming rules.

13) Questions or help
- If you’re unsure how to proceed, open an issue describing what you want to do and ask for guidance.
- New contributors are encouraged — ask for a small starter task if you want to get familiar.

Thank you for contributing to DarijaCode — we appreciate your time and effort.
