# Full-book acceptance · 2026-11-03

## Automated

`npm test` runs 23 tests plus generated-file consistency. Tested on Node.js 25.8.0. The standalone script is also parsed as JavaScript. No third-party runtime dependency is needed.

Coverage includes: BASIC arithmetic, syntax errors, line replacement/deletion, loops and stop; all byte values and bitmap rows; v1-to-v2 migration with a saved tape after power-off; corrupt and unknown schemas; action validation and replay limits; fair scheduling and paused jobs; independent addresses/data; blocked robot recovery; color depth preservation; CPU phase boundaries; missing drivers; bounded file commands and invalid paths; edits invalidating tests before sharing; recorded modem speed; missing/duplicate/out-of-order packets; stale and missing DNS; 404 and escaped HTML; touch mapping; multibyte Unicode; offline edits and conflict resolution; mislabeled training examples; incomplete/repeated/fragmented final messages.

## Actual browser interaction

Local standalone root and modular `dist/` entry were opened in the in-app browser. Existing six-lesson progress migrated to 6/23 without manual storage edits. Each of the 17 new lessons was completed through visible controls, ending at 23/23.

- Scheduler: 12 clock clicks visibly advanced A and B to six steps each.
- Memory: selected address 9, wrote 65, read a different cell, returned and read A. Changed the number to 42 and clicked Write immediately; the destination visibly became 42. This caught and fixed an input/blur issue.
- Robot: hit the rock, installed the conditional rule, reached the flag.
- Colors: chose 2-bit mode, orange and green, painted separate cells.
- CPU: 12 clock operations produced output 5 and halted.
- Drivers: input without a driver failed, then connecting both drivers allowed A to reach the disk.
- Files: typed `write dream.txt HELLO WORLD`, pressed Enter, read it back; reloaded and confirmed the file and terminal history remained.
- Patch: ran failing tests, changed the operator, ran passing tests, shared to the second copy.
- Modem: sent at both speeds; receiver displayed the same bits with a two-second fast duration.
- Packets: delivered 4, dropped 2, delivered 1, repeated 4, delivered 3, then retried 2. Missing space remained visible until the retry, and the full message appeared once.
- DNS: visited, moved the server, saw stale-cache failure, expired the cache, queried and connected again.
- Web: typed a Chinese title, saw 404 at the missing path, requested the homepage and followed the moon link.
- Touch: clicked all four app regions, including a small-screen coordinate, and saw the corresponding coordinates and app labels.
- Unicode: compared A / 你 / 🌱; selected a byte with the Space key and inspected its bit pattern.
- Cloud: edited both devices offline, attempted sync, reloaded, connected, created a version conflict and kept B; all three copies then matched.
- Classifier: a long-fruit example made the new shape predict long; relabeling that example as round changed its prediction to round.
- Final message: typed `A🌱你`, encoded, delivered only a middle packet, confirmed save was blocked, reloaded, delivered the remaining packets out of order, saved and decoded the exact text.
- Notebook and ending displayed all 23 discoveries. The large-type control visibly changed the introduction font to 18 px.

All 23 lesson pages were checked at 390 px for document overflow; representative pages from every chapter at 768, 1024 and 1440 px also had no horizontal overflow. A mobile screenshot was visually inspected. No browser console warning/error was observed in the tested flow.

## Limits

These are local automated checks and actual desktop-browser checks, not a claim that GitHub CI ran these tests. Native iOS/Android devices, screen-reader announcements, actual child usability sessions, and all browser engines remain untested. The later-chapter models intentionally omit real hardware and networking; the VIC-20 now executes real machine emulation as recorded below.


# Real VIC-20 acceptance · 2026-11-03

## Execution and output boundaries

The old `BasicMachine` interpreter and app command/step/output functions were removed. Chapters 0, 1, 2, 5 and `#computer` mount one shared `VICDesk`/`VIC20` runtime. The cover remains a clearly decorative static computer. Bits and pixel grids remain explanatory models; the pixel grid now hands an editable generated program to the same emulator. Later-era models intentionally remain separate teaching models.

- Canvas: the VIC framebuffer, with the chip's palette.
- Accessible text: a read-only screen-RAM mirror (normal 22×23 layout, graphics approximated).
- Direct input and code notebook: the ROM keyboard buffer, followed by real ROM tokenization/execution.
- Code retrieved from the computer, session restore, PRG export/import and machine works: validated linked BASIC bytes from the same RAM.
- Notebook drafts: explicitly separate unsent source; never presented as already executing.
- Audio: actual VIC oscillator samples. Physical keyboard, touch controls and the expanded keyboard feed the same key matrix.

## Automated results

34 tests pass on Node.js 25.8.0 plus standalone byte consistency. The emulator tests boot both RAM configurations and execute original ROMs, not a mocked CPU. They cover FOR/NEXT, arrays, DATA/READ, IF/GOSUB, INPUT, physical GET, real error messages, line replacement/deletion, POKE screen/color changes, audio waveform variation, SYS executing user 6502 instructions, infinite loops/STOP/CONT, byte-exact PRG save/reboot/load, corrupt/wrong-memory PRG rejection before writes, every starter, old tape migration, independent unsent drafts, pixel bytes reaching character RAM, storage quota failure and stale-tab writes. ROM hashes and zero WASM host imports are asserted.

## Actual browser checks

- At the free computer desk, wrote a new FOR/NEXT summation in the editor and ran it. The actual screen displayed `MY ANSWER: 55`.
- Saved the running machine's program to the work box, powered off, opened that work, entered RUN, and observed the same result.
- Reloaded and observed the saved program restored with a READY prompt and the separate editor still present.
- Ran the star game, pressed the on-screen D key, and observed the star move one screen-RAM column. STOP interrupted it; retrieving code returned the stored BASIC.
- Downloaded the actual BASIC PRG, then selected the downloaded `.prg` with the browser file chooser. The import reported successful RAM loading.
- Navigated from the pixel editor through “让老电脑画出来” to the code notebook and sent the generated program into the emulator.
- Inspected desktop and 390×844 layouts visually; the phone document width equaled its 390 px viewport. Text input, game keys and notebook remained available without horizontal page overflow. No console error was observed in the tested flow.

- Opened the generated standalone HTML, stopped its HTTP server, powered on the emulator and entered `PRINT 2^3`; the ROM displayed `8` without a server or external asset fetch.

## Remaining product limits

No actual child usability session or native iOS/Android acceptance has been performed. Desktop-browser audio signal generation is tested, but perceived speaker volume/timbre has not been independently listened to. The work box saves BASIC programs, not running CPU/variable snapshots. Disk, cassette hardware, cartridge import, arbitrary PRG machine-code images, joystick hardware and perfect commercial-game compatibility are outside this release. The local checks do not alone prove public deployment or GitHub CI success; those are verified separately after publication.
