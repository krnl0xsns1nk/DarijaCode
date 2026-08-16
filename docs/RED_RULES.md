# RED_RULES.md

## R1 — Compiled

drj is a compiled language and always produces native executables.

---

## R2 — Darija First

Everything exposed to the user should be written in Darija whenever technically possible, including the language, compiler, CLI, documentation, standard library, packages, and diagnostics.

---

## R3 — General-Purpose

drj is a general-purpose programming language and should be capable of building any kind of software, not be limited to a specific platform or domain.

---

## R4 — Independent Runtime

A compiled drj program must not require Node.js, Python, Java, or any other programming language runtime to execute. It may depend only on the operating system and the drj runtime when required.
