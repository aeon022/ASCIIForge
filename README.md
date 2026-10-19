# 🎨 asciiphreak: ASCII art for hackers, READMEs and source files

[![npm](https://img.shields.io/npm/v/asciiphreak.svg)](https://www.npmjs.com/package/asciiphreak)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Support on Polar](https://img.shields.io/badge/Support_asciiphreak-Polar-0066FF.svg?style=flat-square&logo=polar)](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)
[![Created by abteilung83](https://img.shields.io/badge/Crafted%20by-abteilung83-black.svg)](https://github.com/aeon022)

![asciiphreak demo](docs/demo.png)

*Made with asciiphreak and [ttyreel](https://github.com/aeon022/ttyreel) (`ttyreel play docs/demo.yml`).*

```text
                   _ _       __                    __
  ____ ___________(_|_)___  / /_  ________  ____ _/ /__
 / __ `/ ___/ ___/ / / __ \/ __ \/ ___/ _ \/ __ `/ //_/
/ /_/ (__  ) /__/ / / /_/ / / / / /  /  __/ /_/ / ,<
\__,_/____/\___/_/_/ .___/_/ /_/_/   \___/\__,_/_/|_|
                  /_/
```

**asciiphreak** is a CLI tool by **abteilung83**. It turns text into **ASCII art**, **ANSI-colored terminal text**, and **formatted code comment blocks** for TypeScript, Python, HTML, Rust, and C++ source files.

*asciiphreak was called ASCIIForge before 0.2.0; that name was taken by an unrelated app.*

---

## ✨ Features

- 🔤 **328 FIGlet fonts**, with `-f random`, a preview (`fonts shadow --preview "Hi"`) and typo suggestions.
- 🌈 **Colours and gradients:** presets (`neon`, `fire`, `rainbow`, `cyan` …), a hex colour, or a gradient across any number of colours (`-c "#ff0080,#00f0ff"`), horizontal, vertical or diagonal. `NO_COLOR` is respected.
- ⚡ **Glitch effect:** `--glitch 0.3` shifts rows and breaks characters like a failing screen; `--seed 7` makes it repeatable.
- 📐 **Layout:** `--border single|double|round|bold|ascii`, `--align center|right`, `--width` (wraps the text), `--layout full|fitted|smush` (letter spacing).
- 💬 **Comment blocks for 25+ languages**, safe against sequences that would close the comment early. `--insert file.py --tag hero` puts the block into a file and updates it on the next run instead of adding another.
- 🚀 **Start-up snippets** (`snippet`): code that prints your banner when an app starts (JS, TS, Python, Go, Rust, shell).
- 🖥️ **Login banners** (`motd`): banner plus host, system and uptime.
- 💾 **Files:** `-o banner.svg` / `.html` keep the colours, `.md` wraps it in a code block, anything else is plain text. `--copy` puts it on the clipboard.
- ⚙️ **Defaults per project or user** in `.asciiphreakrc.json` (`asciiphreak init`).
- 🧪 **Pipe-friendly:** the banner is the only thing on stdout, text can be piped in, errors exit with code 1.
- 🔑 **Polar.sh Pro:** support the project and remove the watermark from generated comment blocks.

---

## 🚀 Quickstart

### 1. Installation
Needs Node 18+.

```bash
npm install -g asciiphreak
```

Or try it without installing: `npx asciiphreak text "Hello"`.

New to the terminal? Run `asciiphreak wizard`: it asks a few questions, shows the command and runs it.

### 2. Text banners
```bash
asciiphreak text "Hello"                                      # neon, Slant
asciiphreak text "Hello" -f "ANSI Shadow" -c "#ff0080,#00f0ff"  # gradient
asciiphreak text "v1.0" -c rainbow --border round --align center --width 60
echo "Release day" | asciiphreak text -c fire                 # from a pipe
asciiphreak text "Hello" -c plain > banner.txt                # stdout is only the art
asciiphreak text "Hello" -c "#ff0080,#00f0ff" -o banner.svg   # coloured SVG
asciiphreak text "Hello" --copy                               # clipboard
asciiphreak text "SYSTEM FAILURE" -c fire --glitch 0.5 --seed 7  # glitch effect
```

### 3. Code comments
```bash
asciiphreak comment "SYNC ENGINE" -L typescript >> src/sync.ts       # print / append
asciiphreak comment "SYNC ENGINE" --insert src/sync.ts --tag hero    # put it in, update on re-run
asciiphreak comment "DATA PIPELINE" --insert pipeline.py --at 3      # at line 3 (language from the extension)
```

Output (the watermark line is removed by a Pro licence):
```typescript
/*
 *    _______  ___   ________   _______   _____________   ________
 *   / ___/\ \/ / | / / ____/  / ____/ | / / ____/  _/ | / / ____/
 *   \__ \  \  /  |/ / /      / __/ /  |/ / / __ / //  |/ / __/
 *  ___/ /  / / /|  / /___   / /___/ /|  / /_/ // // /|  / /___
 * /____/  /_/_/ |_/\____/  /_____/_/ |_/\____/___/_/ |_/_____/
 * [Crafted with asciiphreak by abteilung83]
 */
```

`--language` (`-L`) knows TypeScript/JavaScript, C, C++, C#, Java, Go, Rust, Swift, Kotlin, PHP, CSS/SCSS (block comments), Python, shell, YAML, Ruby, TOML, Dockerfile (`#`), SQL, Lua (`--`), HTML, Markdown and XML; `asciiphreak languages` lists them with aliases (`ts`, `py`, `sh`, `yml` …). With `--tag`, the block sits between `asciiphreak:begin NAME` and `asciiphreak:end NAME` comment lines; do not edit between them. A `#!` line stays first.

### 4. Start-up banner and login banner
```bash
asciiphreak snippet "MyApp" -L python     # prints code that shows the banner when your app starts
asciiphreak motd "my-server"              # banner + host · OS · uptime, for ~/.bashrc or /etc/motd
```

### 5. Fonts
```bash
asciiphreak fonts                          # all of them
asciiphreak fonts shadow --preview "Hi"    # draw each font whose name contains "shadow"
asciiphreak text "Hi" -f random            # surprise me
```
A misspelled font is an error with a suggestion (`Did you mean "Slant"?`), not a silent different font.

### 6. Project defaults
```bash
asciiphreak init      # writes .asciiphreakrc.json
```
```json
{ "font": "Slant", "color": "neon", "language": "typescript", "align": "left", "border": "none", "pad": 1 }
```
Settings are read from `~/.config/asciiphreak/defaults.json`, then from the nearest `.asciiphreakrc.json` up the folder tree; flags win. A typo in the file is an error that names it.

---

## 💜 Pro License & Support

Support further development and remove comment watermarks!

👉 **[Support & Unlock Pro on Polar](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)**

---

## 🏢 About abteilung83

**asciiphreak** is engineered and maintained by **abteilung83** — specializing in developer tools, CLI utilities, workflow automation, and open-source integrations.

- **GitHub**: [@aeon022](https://github.com/aeon022)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
