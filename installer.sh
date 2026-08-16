#!/usr/bin/env bash

set -e

REPO="krnl0xsns1nk/drj"

OS="$(uname -s)"
ARCH="$(uname -m)"

# Detect operating system.
case "$OS" in
    Linux|Darwin)
        ;;
    *)
        echo "Error: unsupported operating system: $OS"
        exit 1
        ;;
esac

# Detect architecture.
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
        exit 1
        ;;
esac

# Detect Termux / Android.
if [ -n "${PREFIX:-}" ] && [ -d "$PREFIX" ]; then
    PLATFORM="android"
    INSTALL_DIR="$PREFIX/bin"

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
            exit 1
            ;;
    esac
else
    case "$OS" in
        Linux)
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
                    exit 1
                    ;;
            esac
            ;;

        Darwin)
            PLATFORM="macos"

            case "$ARCH" in
                x86_64)
                    ASSET="drj-macos-x86_64"
                    ;;
                aarch64)
                    ASSET="drj-macos-aarch64"
                    ;;
                *)
                    echo "Error: unsupported macOS architecture: $ARCH"
                    exit 1
                    ;;
            esac
            ;;
    esac

    INSTALL_DIR="${HOME}/.local/bin"
fi

echo "Operating system: $OS"
echo "Architecture:     $ARCH"
echo "Platform:         $PLATFORM"
echo "Asset:            $ASSET"
echo "Install path:     $INSTALL_DIR/drj"

# Find latest GitHub release.
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
    exit 1
fi

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET}"

TMP_FILE="$(mktemp)"

# Download binary.
if ! curl -fL "$DOWNLOAD_URL" -o "$TMP_FILE"; then
    echo "Error: failed to download $ASSET"
    echo "Error: release $LATEST_TAG may not contain a binary for $PLATFORM-$ARCH"
    rm -f "$TMP_FILE"
    exit 1
fi

# Install binary.
mkdir -p "$INSTALL_DIR"

mv "$TMP_FILE" "${INSTALL_DIR}/drj"
chmod +x "${INSTALL_DIR}/drj"

echo "Installed: ${INSTALL_DIR}/drj"

# Check PATH.
case ":${PATH}:" in
    *":${INSTALL_DIR}:"*)
        echo "Jrb: drj program.drj"
        ;;

    *)
        echo
        echo "Your shell does not know where drj is yet."
        echo "Add this directory to your PATH:"
        echo
        echo "  $INSTALL_DIR"
        echo
        echo "If you use Bash, run:"
        echo "  echo 'export PATH=\"$INSTALL_DIR:\$PATH\"' >> ~/.bashrc"
        echo "  source ~/.bashrc"
        echo
        echo "If you use Zsh, run:"
        echo "  echo 'export PATH=\"$INSTALL_DIR:\$PATH\"' >> ~/.zshrc"
        echo "  source ~/.zshrc"
        echo
        echo "Then you can run:"
        echo "  drj program.drj"
        ;;
esac
