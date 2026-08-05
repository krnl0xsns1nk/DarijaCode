#!/usr/bin/env bash

set -e
clang \
    $(find src -name "*.c") \
    -Iinclude \
    -g \
    -O0 \
    -Wall \
    -Wextra \
    -Wpedantic \
    -Wconversion \
    -Wshadow \
    -Wstrict-prototypes \
    -Wmissing-prototypes \
    -Wnull-dereference \
    -Wdouble-promotion \
    -Wformat=2 \
    -fsanitize=address,undefined \
    -fno-omit-frame-pointer \
    -o run

