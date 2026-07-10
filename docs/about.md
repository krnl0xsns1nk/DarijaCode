# DarijaCode

## Overview

DarijaCode is a programming language designed to make programming more accessible by allowing developers to write code using Moroccan Darija-inspired keywords while keeping the power and flexibility of modern programming languages.

The goal of DarijaCode is not to replace existing languages, but to create a bridge between human language and programming concepts.

Programming languages are powerful, but their syntax is often one of the first barriers for beginners. DarijaCode explores the idea that people should be able to learn programming concepts without first fighting unfamiliar English keywords.

Example:

Python:

```python
print("Hello world")

DarijaCode:

kteb("Hello world")

The concept remains the same:

a command

a value

execution



---

Philosophy

1. Programming should be understandable

DarijaCode is built around the idea that syntax should feel natural.

A beginner should look at:

kteb("Salam")

and immediately understand:

"Write Salam."

The language removes unnecessary complexity from the learning stage while keeping advanced possibilities available.


---

2. Simple by default, powerful when needed

DarijaCode follows the philosophy:

"Easy to start, deep enough to grow."

A beginner can write:

kteb("hello")

without understanding memory, types, or compilation.

An advanced developer can use:

custom types

modules

packages

functions

classes

native compilation

system programming



---

3. Flexibility over restrictions

DarijaCode allows beginners to write dynamically:

dir age = 20

age = "twenty"

The language accepts flexible programming.

However, developers can choose more control:

dir age: ra9m = 20

age = "twenty"

Error:

twa93n ra9m, wlkin l9ina text

The philosophy is:

Dynamic when you want speed.

Strict when you want safety.


---

How DarijaCode Works

DarijaCode is a compiled programming language.

The pipeline:

DarijaCode Source

      |
      v

Parser

      |
      v

AST (Abstract Syntax Tree)

      |
      +----------------+
      |                |
      v                v

Runtime          Compiler

      |                |
      v                v

Execute       Native Program


---

Source Code

Users write:

program.drj

Example:

dir name = "Ali"

kteb(name)


---

Parser

The parser understands the structure of the program.

Example:

kteb("hello")

becomes:

Program

 └── PrintStatement

       └── String
            "hello"

The parser does not execute code.

It only understands meaning.


---

AST

The Abstract Syntax Tree is the internal representation of the program.

Example:

Input:

dir age = 20

AST:

VariableDeclaration

name:
    age

value:
    20

Everything after this works with the AST.


---

Runtime

The runtime is responsible for executing DarijaCode programs.

Example:

dir age = 20

kteb(age)

Runtime stores:

Environment:

age -> 20

When:

kteb(age)

runs:

Look for age

Find 20

Print 20


---

Compiler

DarijaCode can compile programs into native executables.

Example:

DarijaCode:

kteb("hello")

Internal:

AST
 |
 v
Code Generator
 |
 v
C
 |
 v
Binary executable

The user can run:

darijacode app.drj

without manually handling the compilation process.


---

Language Features

Variables

Dynamic:

dir name = "Ali"

Typed:

khli age: ra9m = 20


---

Functions

fn jam3(a, b){

    rja3 a + b

}

Meaning:

Create a function.

Return result.


---

Modules

jib math mn "math"

Import functionality.


---

Packages

darijacode install <package>

Similar to:

npm

pip

cargo



---

Error Philosophy

Errors should teach, not only reject.

Bad:

Syntax error

DarijaCode:

DarijaCode Error:

1 | kteb("hello

          ^

l text 9a3 matsdat.

jrb : kteb("hello")

The compiler should explain:

what happened

where it happened

how to fix it



---

Target Users

Beginners

Students who want to learn programming.

They learn:

variables

conditions

loops

functions

algorithms


without fighting foreign syntax.

Experienced developers

People who want:

fast scripting

native language syntax

experimentation

another programming model



---

Long Term Vision

DarijaCode aims to become:

an educational language

a scripting language

a general-purpose programming language

a Moroccan contribution to programming languages


The goal is not only creating another syntax.

The goal is creating a programming environment where the distance between human thinking and computer instructions becomes smaller.

One design note: the strongest identity of DarijaCode is not "Arabic keywords". Many projects have translated keywords. The interesting part is your philosophy:

**"A language where beginners understand programming concepts first, then gradually unlock complexity."**

That is a much stronger foundation.
