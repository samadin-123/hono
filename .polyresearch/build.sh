#!/bin/bash
set -e

export PATH="$HOME/.bun/bin:$PATH"

# Run the main build
rm -rf dist
bun ./build/build.ts

# Generate TypeScript declarations
npx tsc --emitDeclarationOnly --declaration --project tsconfig.build.json || {
    echo "Warning: TypeScript compilation had issues, continuing..."
}

# Run the remove private fields script if types were generated
if [ -d "dist/types" ]; then
    echo "Type definitions generated successfully"
    # Copy package.json files
    cp ./package.cjs.json ./dist/cjs/package.json
    cp ./package.cjs.json ./dist/types/package.json
else
    echo "Warning: No dist/types directory, skipping package.json copy to types"
    cp ./package.cjs.json ./dist/cjs/package.json || true
fi

echo "Build completed"
