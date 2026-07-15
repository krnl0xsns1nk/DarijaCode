<div align="center">

# 🕊️ DarijaCode

A programming language and compiler written for fun, using Moroccan Darija.

[![Status](https://img.shields.io/badge/status-experimental-orange)](https://github.com/krnl0xsns1nk/DarijaCode)
[![Language](https://img.shields.io/badge/language-TypeScript-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-DCL-blue)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/krnl0xsns1nk/DarijaCode?style=social)](https://github.com/krnl0xsns1nk/DarijaCode)

</div>

---

## Installation

### Quick install

Linux / Termux:

```bash
curl -fsSL https://raw.githubusercontent.com/krnl0xsns1nk/DarijaCode/main/scripts/install.sh | sh
```

---


> **DarijaCode is a hobby project built for learning compiler development and experimenting with a programming language based on Moroccan Darija.**
>
> It is **not** trying to replace JavaScript, Python, C, or any existing language.

---

## Why?

The goal isn't simply replacing English keywords.

The goal is building a complete programming ecosystem where everything speaks Darija:

- lexer
- parser
- semantic checker
- native compiler
- CLI
- runtime
- package manager *(planned)*
- standard library *(planned)*
- compiler errors written in Darija

For example:

```drj
kteb("Salam");
```
and when something goes wrong, the compiler also responds in Darija:
- take a real example of mine :

<pre style="background:#0d1117; color:#c9d1d9; padding:16px; border-radius:8px; font-family:monospace; overflow-x:auto">
<span style="color:#7ee787">user@localhost</span> <span style="color:#a5d6ff">~/projects/DarijaCode</span> <span style="color:#ffa657">(master●)</span>
<span style="color:#7ee787">$</span> <span style="color:#ffa657">bat ex.drj</span>

 <span style="color:#8b949e">│</span> <span style="color:#8b949e">File: ex.drj</span>
<span style="color:#8b949e">──┼────────────────────────────────────────</span>
<span style="color:#8b949e">1</span> <span style="color:#8b949e">│</span> <span style="color:#d2a8ff">dir</span> <span style="color:#79c0ff">name</span> <span style="color:#c9d1d9">:</span> <span style="color:#79c0ff">ra9m</span> <span style="color:#c9d1d9">=</span> <span style="color:#a5d6ff">"krnl0xsns"</span><span style="color:#c9d1d9">;</span>
<span style="color:#8b949e">2</span> <span style="color:#8b949e">│</span> <span style="color:#d2a8ff">kteb</span><span style="color:#c9d1d9">(</span><span style="color:#79c0ff">name</span><span style="color:#c9d1d9">);</span>
<span style="color:#8b949e">──┴────────────────────────────────────────</span>

<span style="color:#7ee787">user@localhost</span> <span style="color:#a5d6ff">~/projects/DarijaCode</span> <span style="color:#ffa657">(master●)</span>
<span style="color:#7ee787">$</span> <span style="color:#ffa657">drj run ex.drj</span>
<span style="color:#f85149; font-weight:bold">DarijaCode error[checker:DCE15]</span> <span style="color:#ffa657">twa93na ra9m, wlkin l9ina nass</span>
<span style="color:#58a6ff">--> /data/data/com.termux/files/home/projects/DarijaCode/ex.drj:1:1</span>
<span style="color:#8b949e">1</span> <span style="color:#8b949e">│</span> <span style="color:#d2a8ff">dir</span> <span style="color:#79c0ff">name</span> <span style="color:#c9d1d9">:</span> <span style="color:#79c0ff">ra9m</span> <span style="color:#c9d1d9">=</span> <span style="color:#a5d6ff">"krnl0xsns"</span><span style="color:#c9d1d9">;</span>
  <span style="color:#8b949e">│</span> <span style="color:#f85149">^</span>
<span style="color:#a371f7">jrb/chof:</span> <span style="color:#ffa657">ach ban link tstkhdm ra9m fbalst nass</span>
</pre>

- see docs/error_codes.md for more info about these codes.
