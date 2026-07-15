#!/usr/bin/env bash

set -e

GREEN="\033[1;32m"
RED="\033[1;31m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
RESET="\033[0m"

info() {
    printf "${BLUE}[INFO]${RESET} %s\n" "$1"
}

success() {
    printf "${GREEN}[ OK ]${RESET} %s\n" "$1"
}

warn() {
    printf "${YELLOW}[WARN]${RESET} %s\n" "$1"
}

error() {
    printf "${RED}[FAIL]${RESET} %s\n" "$1"
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1
}

install_termux() {
    info "Detected Termux"

    pkg update -y
    pkg install -y nodejs clang git

    success "Dependencies installed"
}

install_debian() {
    info "Detected Debian/Ubuntu"

    sudo apt update
    sudo apt install -y nodejs npm clang git

    success "Dependencies installed"
}

install_arch() {
    info "Detected Arch Linux"

    sudo pacman -Sy --noconfirm nodejs npm clang git

    success "Dependencies installed"
}

detect_system() {

    if require_command pkg && [ -n "$PREFIX" ]; then
        install_termux
        return
    fi

    if [ -f /etc/debian_version ]; then
        install_debian
        return
    fi

    if [ -f /etc/arch-release ]; then
        install_arch
        return
    fi

    error "Unsupported operating system."
}

echo
echo "====================================="
echo "      DarijaCode Installer"
echo "====================================="
echo

if ! require_command node; then
    warn "Node.js not found, we will install it for you"
    detect_system
else
    success "Node.js found ($(node -v))"
fi

if ! require_command clang && ! require_command gcc; then
    warn "C compiler not found, we will install it for you"
    detect_system
else
    success "C compiler found"
fi

if ! require_command npm; then
    error "npm is not installed."
fi

info "Installing DarijaCode..."

npm install -g darijacode

success "DarijaCode installed"

echo

if require_command drj; then
    drj -v
fi

echo
echo "====================================="
echo "wafin, al3alam !"
echo "tama tatbit binajah"
echo "====================================="
echo
echo "jrb:"
echo
echo 'echo '\''kteb("wafin, al3alam!");'\'' > hello.drj'
echo "drj run hello.drj"
echo
