#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: npm run now -- <file>"
  exit 1
fi

FILE=$1
NAME=$(basename "$FILE" .drj)

if [ ! -d "dist" ]; then
  echo "dist folder not found. Running npm run build..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
  fi
fi


echo "Compiling $FILE..."
npm run start "$FILE"

if [ $? -eq 0 ]; then
  echo "Running ./$NAME...\n"
  chmod +x "./$NAME" 2>/dev/null
  "./$NAME"
else
  echo "Compilation failed"
  exit 1
fi
