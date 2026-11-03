# VIC-20 emulator sources and ROM provenance

The browser executes a WebAssembly build of `core.c`. It contains a real 6502 CPU, two VIA 6522 chips, a PAL VIC 6561 video/audio chip, memory mapping, and keyboard scanning. User BASIC is tokenized/interpreted by the original ROM running on the emulated CPU. The JavaScript adapter feeds keyboard input and transfers validated BASIC PRG files; it does not interpret BASIC or precompute its output.

## Hardware core

Unmodified headers in `vendor/` are from [floooh/chips](https://github.com/floooh/chips/tree/9e88298ce56319953ac7a43213a1120359f7a3a6), commit `9e88298ce56319953ac7a43213a1120359f7a3a6`. They are distributed under the zlib/libpng license, reproduced in [vendor/LICENSE](vendor/LICENSE); each header retains its original notice. The directory layout is flattened. The Every Bit bridge and browser UI are original to this project, not copied from another emulator's browser wrapper.

## Original ROM images

`dist/vic20-roms.mjs` embeds the following original Commodore ROM bytes, concatenated in this order. These ROMs are **not covered by the chips zlib license**. Original Commodore copyright remains with its respective rights holders; this project does not claim authorship, public-domain status, or a new license for the ROMs.

Distribution source: [nippur72/vic20-emu, wasm/roms](https://github.com/nippur72/vic20-emu/tree/c66ab106d00f381ee339135a892c38669b1d7c82/wasm/roms), pinned commit `c66ab106d00f381ee339135a892c38669b1d7c82`. No third-party games are included.

| Image | Bytes | SHA-256 |
| --- | ---: | --- |
| vic20_characters_901460_03.bin | 4096 | bda280726cfe069ca70ef5e2f2d95a29f69d3950c859a12e6979464963fcf502 |
| vic20_basic_901486_01.bin | 8192 | 8be2d882e0eeb1c6923a43660236ea69d43ca8a3bd0613b1b6c910601584fbed |
| vic20_kernal_901486_07.bin | 8192 | ff6d1416b91a71f5240a5bb8adc9fdc1b955374c48322ca47b3e436334f168fb |

## Rebuilding

Built with the official [WASI SDK 34](https://github.com/WebAssembly/wasi-sdk/releases/tag/wasi-sdk-34), arm64 macOS distribution. Download the SDK to a directory of your choice, then run:

```sh
WASI_CLANG=/path/to/wasi-sdk/bin/clang node scripts/build-emulator.mjs
npm run build:standalone
npm test
```

The build writes `vic20.wasm` and its base64 distribution module `dist/vic20-wasm.mjs`. There are no WebAssembly host imports, network requests, remote execution services, or host JavaScript evaluation. The executable has a fixed 4 MiB linear memory. CPU execution is bounded per animation frame; a guest infinite loop does not become a JavaScript infinite loop.

## Boundaries

- PAL machine, unexpanded or 24 KiB expansion. No claim of perfect compatibility with every historical hardware quirk or commercial game.
- BASIC V2, direct commands, keyboard, video, audio, PEEK/POKE and SYS execute on the original machine architecture.
- The work box supports validated linked BASIC PRG files at `$1001` or `$1201`. Arbitrary machine-code binaries, cartridge images, disk images and TAP files are not imported. Machine code written by the child's BASIC program can execute with SYS.
- No datasette or disk peripheral is connected. ROM SAVE/LOAD commands therefore wait for hardware; the browser's work box and PRG downloads are deliberately separate controls.
- Refresh restores BASIC program bytes and the separate editor draft. CPU registers, variables, current game position, queued input and audio state are not persisted. Leaving the computer desk freezes the same in-memory machine until returning; refresh boots it afresh.
- Screen text is an accessibility mirror of screen RAM, not an alternate output engine. It approximates graphic characters and assumes the normal 22×23 text layout; the canvas always uses the VIC framebuffer.
