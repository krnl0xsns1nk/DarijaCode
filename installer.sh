#!/usr/bin/env bash

set -e

REPO="krnl0xsns1nk/DarijaCode"
INSTALL_DIR="${HOME}/.local/bin"

# ------------------------------------------------------------
# Detect operating system
# ------------------------------------------------------------

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux|Darwin)
        ;;
    *)
        echo "Error: unsupported operating system: $OS"
        echo "Error: had nidam tachghil mamd3omch: $OS"
        exit 1
        ;;
esac

# ------------------------------------------------------------
# Detect architecture
# ------------------------------------------------------------

case "$ARCH" in
    x86_64|amd64)
        ARCH="x86_64"
        ;;
    aarch64|arm64)
        ARCH="aarch64"
        ;;
    armv7l|armv7)
        ARCH="armv7"
        ;;
    *)
        echo "Error: unsupported architecture: $ARCH"
        echo "Error: had lmi3marya mamd3omach: $ARCH"  
        exit 1
        ;;
esac

# ------------------------------------------------------------
# Detect Android / Termux
# ------------------------------------------------------------

if [ -n "${PREFIX:-}" ] && [ -d "$PREFIX" ]; then
    PLATFORM="android"

    case "$ARCH" in
        aarch64)
            ASSET="drj-android-aarch64"
            ;;
        armv7)
            ASSET="drj-android-armv7"
            ;;
        x86_64)
            ASSET="drj-android-x86_64"
            ;;
        *)
            echo "Error: unsupported Android architecture: $ARCH"
            echo "Error: had lmi3maryat Android mmd3omach: $ARCH"
            exit 1
            ;;
    esac
else
    PLATFORM="linux"

    case "$ARCH" in
        x86_64)
            ASSET="drj-linux-x86_64"
            ;;
        aarch64)
            ASSET="drj-linux-aarch64"
            ;;
        *)
            echo "Error: unsupported Linux architecture: $ARCH"
            echo "Error: had lmi3maryat Linux mmd3omach: $ARCH"
            exit 1
            ;;
    esac
fi

echo "Operating system: $OS"
echo "Architecture:     $ARCH"
echo "Platform:         $PLATFORM"
echo "Asset:            $ASSET"

# ------------------------------------------------------------
# Find latest GitHub release
# ------------------------------------------------------------

LATEST_TAG="$(
    curl -fsSL \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/${REPO}/releases/latest" |
        grep '"tag_name":' |
        head -n 1 |
        sed -E 's/.*"tag_name": "([^"]+)".*/\1/'
)"

if [ -z "$LATEST_TAG" ]; then
    echo "Error: could not determine the latest release."
    echo "Error: had sa3a ma9drnach n7addo akhir issdar."
    exit 1
fi

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET}"

# ------------------------------------------------------------
# Download binary
# ------------------------------------------------------------

TMP_FILE="$(mktemp)"

if ! curl -fL "$DOWNLOAD_URL" -o "$TMP_FILE"; then
    echo "Error: failed to download $ASSET"
    echo "Error: release $LATEST_TAG may not contain a binary for $PLATFORM-$ARCH"
    rm -f "$TMP_FILE"
    exit 1
fi

# ------------------------------------------------------------
# Install
# ------------------------------------------------------------

mkdir -p "$INSTALL_DIR"

mv "$TMP_FILE" "${INSTALL_DIR}/drj"

chmod +x "${INSTALL_DIR}/drj"

echo "Installed: ${INSTALL_DIR}/drj"

# ------------------------------------------------------------
# PATH check
# ------------------------------------------------------------

case ":${PATH}:" in
    *":${INSTALL_DIR}:"*)
        echo "Jrb: drj program.drj"
        ;;
    *)
        case "${SHELL:-}" in
            */zsh)
                echo "Add to PATH:"
                echo '  echo '\''export PATH="$HOME/.local/bin:$PATH"'\'' >> ~/.zshrc'
                echo "  source ~/.zshrc"
                ;;
            *)
                echo "Add to PATH:"
                echo '  echo '\''export PATH="$HOME/.local/bin:$PATH"'\'' >> ~/.bashrc'
                echo "  source ~/.bashrc"
                ;;
        esac
        ;;
esac
