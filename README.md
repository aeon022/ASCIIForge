# 🎨 ASCIIForge: ASCII Art & Terminal Banner Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Support on Polar](https://img.shields.io/badge/Support_ASCIIForge-Polar-0066FF.svg?style=flat-square&logo=polar)](https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH)
[![Created by abteilung83](https://img.shields.io/badge/Crafted%20by-abteilung83-black.svg)](https://github.com/aeon022)

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

- 🔤 **300+ ASCII Fonts**: Powered by FIGlet's full bundled font library — includes popular picks like `Slant`, `Standard`, `Block`, `ANSI Shadow`, `3D-ASCII`, `Star Wars`, and hundreds more (run `ascii-forge fonts` for the full list).
- 🌈 **8 ANSI Color Presets**: `neon`, `fire`, `cyan`, `magenta`, `green`, `yellow`, `red`, `plain`.
- 💬 **Code Comment Block Generator**: Wraps ASCII banners in valid source code comments (`/* ... */`, `"""..."""`, `<!-- ... -->`).
- 🚀 **Pure JS, No Native Dependencies**: No compiled/native modules to install — blazing fast rendering in under 10 milliseconds.
- 🔑 **Polar.sh Pro License**: Support the project via Polar and remove the watermark from generated comment blocks.

---

## 🚀 Quickstart & Tutorial

### 1. Installation
Install straight from GitHub (needs Node 18+; the package builds itself on install):

```bash
npm install -g github:aeon022/ASCIIForge
# or run once without installing:
npx github:aeon022/ASCIIForge text "Hello"
```

### 2. Generate ASCII Text Banner
Generate a colored ASCII banner in your terminal:

```bash
ascii-forge text "JoplinBridge" --font slant --color neon
```

### 3. Generate Formatted Code Comments
Generate ASCII section headers directly formatted as TypeScript/JavaScript code comments:

```bash
ascii-forge comment "SYNC ENGINE" --language typescript
```

Output:
```typescript
/*
 *    _______  ___   ________   _______   _____________   ________
 *   / ___/\ \/ / | / / ____/  / ____/ | / / ____/  _/ | / / ____/
 *   \__ \  \  /  |/ / /      / __/ /  |/ / / __ / //  |/ / __/   
 *  ___/ /  / / /|  / /___   / /___/ /|  / /_/ // // /|  / /___   
 * /____/  /_/_/ |_/\____/  /_____/_/ |_/\____/___/_/ |_/_____/   
 *                                                                
 */
```

### 4. List Popular Fonts
```bash
ascii-forge fonts
```

---

## 💜 Pro License & Support

Support further development and remove comment watermarks!

👉 **[Support & Unlock Pro on Polar](https://buy.polar.sh/polar_cl_BN6xwyJH2Drn6WuzvV49E2KCGauvtoTHixD3w1hCpSH)**

---

## 🏢 About abteilung83

**ASCIIForge** is engineered and maintained by **abteilung83** — specializing in developer tools, CLI utilities, workflow automation, and open-source integrations.

- **GitHub**: [@aeon022](https://github.com/aeon022)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
