# 🎨 ASCIIForge: ASCII Art & Terminal Banner Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Support on Polar](https://img.shields.io/badge/Support_ASCIIForge-Polar-0066FF.svg?style=flat-square&logo=polar)](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)
[![Created by abteilung83](https://img.shields.io/badge/Crafted%20by-abteilung83-black.svg)](https://github.com/aeon022)

![ASCIIForge demo](docs/demo.png)

*Made with ASCIIForge and [ttyreel](https://github.com/aeon022/ttyreel) (`ttyreel play docs/demo.yml`).*

```text
    ___   _____ ____________________                    
   /   | / ___// ____/  _/  _/ ____/___  _________ ____ 
  / /| | \__ \/ /    / / / // /_  / __ \/ ___/ __ `/ _ \
 / ___ |___/ / /____/ /_/ // __/ / /_/ / /  / /_/ /  __/
/_/  |_/____/\____/___/___/_/    \____/_/   \__, /\___/ 
                                           /____/       
```

**ASCIIForge** is a lightweight CLI tool engineered by **abteilung83**. It converts text strings and headers into stunning **ASCII art banners**, **ANSI-colored terminal text**, and **formatted code comment blocks** for TypeScript, Python, HTML, Rust, and C++ source files.

---

## ✨ Features

- 🔤 **328 FIGlet fonts**, with `-f random`, a preview (`fonts shadow --preview "Hi"`) and typo suggestions.
- 🌈 **Colours and gradients:** presets (`neon`, `fire`, `rainbow`, `cyan` …), a hex colour, or a gradient across any number of colours (`-c "#ff0080,#00f0ff"`), horizontal, vertical or diagonal. `NO_COLOR` is respected.
- 📐 **Layout:** `--border single|double|round|bold|ascii`, `--align center|right`, `--width` (wraps the text), `--layout full|fitted|smush` (letter spacing).
- 💬 **Comment blocks for 25+ languages**, safe against sequences that would close the comment early. `--insert file.py --tag hero` puts the block into a file and updates it on the next run instead of adding another.
- 🚀 **Start-up snippets** (`snippet`): code that prints your banner when an app starts (JS, TS, Python, Go, Rust, shell).
- 🖥️ **Login banners** (`motd`): banner plus host, system and uptime.
- 💾 **Files:** `-o banner.svg` / `.html` keep the colours, `.md` wraps it in a code block, anything else is plain text. `--copy` puts it on the clipboard.
- ⚙️ **Defaults per project or user** in `.asciiforgerc.json` (`ascii-forge init`).
- 🧪 **Pipe-friendly:** the banner is the only thing on stdout, text can be piped in, errors exit with code 1.
- 🔑 **Polar.sh Pro:** support the project and remove the watermark from generated comment blocks.

---

## 🚀 Quickstart

### 1. Installation
Needs Node 18+. Try it without installing:

```bash
npx github:aeon022/ASCIIForge text "Hello"
```

Install it (keep the cloned folder: the global command links to it):

```bash
git clone https://github.com/aeon022/ASCIIForge.git
cd ASCIIForge
npm install --omit=dev
npm install -g .
```

### 2. Text banners
```bash
ascii-forge text "Hello"                                      # neon, Slant
ascii-forge text "Hello" -f "ANSI Shadow" -c "#ff0080,#00f0ff"  # gradient
ascii-forge text "v1.0" -c rainbow --border round --align center --width 60
echo "Release day" | ascii-forge text -c fire                 # from a pipe
ascii-forge text "Hello" -c plain > banner.txt                # stdout is only the art
ascii-forge text "Hello" -c "#ff0080,#00f0ff" -o banner.svg   # coloured SVG
ascii-forge text "Hello" --copy                               # clipboard
```

### 3. Code comments
```bash
ascii-forge comment "SYNC ENGINE" -L typescript >> src/sync.ts       # print / append
ascii-forge comment "SYNC ENGINE" --insert src/sync.ts --tag hero    # put it in, update on re-run
ascii-forge comment "DATA PIPELINE" --insert pipeline.py --at 3      # at line 3 (language from the extension)
```

Output (the watermark line is removed by a Pro licence):
```typescript
/*
 *    _______  ___   ________   _______   _____________   ________
 *   / ___/\ \/ / | / / ____/  / ____/ | / / ____/  _/ | / / ____/
 *   \__ \  \  /  |/ / /      / __/ /  |/ / / __ / //  |/ / __/
 *  ___/ /  / / /|  / /___   / /___/ /|  / /_/ // // /|  / /___
 * /____/  /_/_/ |_/\____/  /_____/_/ |_/\____/___/_/ |_/_____/
 * [Crafted with ASCIIForge by abteilung83]
 */
```

`--language` (`-L`) knows TypeScript/JavaScript, C, C++, C#, Java, Go, Rust, Swift, Kotlin, PHP, CSS/SCSS (block comments), Python, shell, YAML, Ruby, TOML, Dockerfile (`#`), SQL, Lua (`--`), HTML, Markdown and XML; `ascii-forge languages` lists them with aliases (`ts`, `py`, `sh`, `yml` …). With `--tag`, the block sits between `ascii-forge:begin NAME` and `ascii-forge:end NAME` comment lines; do not edit between them. A `#!` line stays first.

### 4. Start-up banner and login banner
```bash
ascii-forge snippet "MyApp" -L python     # prints code that shows the banner when your app starts
ascii-forge motd "my-server"              # banner + host · OS · uptime, for ~/.bashrc or /etc/motd
```

### 5. Fonts
```bash
ascii-forge fonts                          # all of them
ascii-forge fonts shadow --preview "Hi"    # draw each font whose name contains "shadow"
ascii-forge text "Hi" -f random            # surprise me
```
A misspelled font is an error with a suggestion (`Did you mean "Slant"?`), not a silent different font.

### 6. Project defaults
```bash
ascii-forge init      # writes .asciiforgerc.json
```
```json
{ "font": "Slant", "color": "neon", "language": "typescript", "align": "left", "border": "none", "pad": 1 }
```
Settings are read from `~/.config/ascii-forge/defaults.json`, then from the nearest `.asciiforgerc.json` up the folder tree; flags win. A typo in the file is an error that names it.

---

## 💜 Pro License & Support

Support further development and remove comment watermarks!

👉 **[Support & Unlock Pro on Polar](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)**

---

## 🏢 About abteilung83

**ASCIIForge** is engineered and maintained by **abteilung83** — specializing in developer tools, CLI utilities, workflow automation, and open-source integrations.

- **GitHub**: [@aeon022](https://github.com/aeon022)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
