# 🎨 ASCIIForge — Comprehensive Tutorial & How-To Guide

Welcome to the **ASCIIForge** tutorial! This guide covers real-world setup recipes, CLI commands, code comment generation, and font customization options.

---

## 📚 Table of Contents

1. [Quick Installation](#1-quick-installation)
2. [Workflow 1: Creating ASCII Banners for CLI Tools & Startup Screens](#workflow-1-creating-ascii-banners-for-cli-tools--startup-screens)
3. [Workflow 2: Generating Code Comment Section Headers](#workflow-2-generating-code-comment-section-headers)
4. [Workflow 3: Saving ASCII Art to Text Files](#workflow-3-saving-ascii-art-to-text-files)
5. [Workflow 4: Exploring Font Styles & Color Presets](#workflow-4-exploring-font-styles--color-presets)
6. [Pro License Activation](#pro-license-activation)

---

## 1. Quick Installation

Install ASCIIForge globally via npm:

```bash
git clone https://github.com/aeon022/ASCIIForge.git && cd ASCIIForge && npm install --omit=dev && npm install -g .
```

Or run via `npx`:

```bash
npx github:aeon022/ASCIIForge demo
```

---

## Workflow 1: Creating ASCII Banners for CLI Tools & Startup Screens

To render a vibrant ASCII title banner for your CLI app:

```bash
ascii-forge text "ttyreel" --font slant --color neon
```

---

## Workflow 2: Generating Code Comment Section Headers

You can generate valid comment blocks for your source code files in TypeScript, Python, HTML, Rust, or CSS:

### TypeScript / JavaScript:
```bash
ascii-forge comment "CORE UTILS" --language typescript
```

### Python (`""" ... """`):
```bash
ascii-forge comment "DATA PIPELINE" --language python
```

### HTML (`<!-- ... -->`):
```bash
ascii-forge comment "NAVIGATION" --language html
```

---

## Workflow 3: Saving ASCII Art to Text Files

Save the plain ASCII output directly into a file (for READMEs or config files):

```bash
ascii-forge text "MY APP" --font block --output banner.txt
```

---

## Workflow 4: Exploring Font Styles & Color Presets

### Recommended Fonts (`-f` / `--font`)
- `Slant` (Sleek modern angular)
- `Standard` (Bold classic)
- `Block` (Heavy 3D block text)
- `ANSI Shadow` (Retro shadow text)
- `3D-ASCII` (3D outline style)
- `Star Wars` (Sci-fi styled font)

### Color Presets (`-c` / `--color`)
- `neon` (Cyan + Magenta alternating lines)
- `fire` (Red + Yellow alternating lines)
- `cyan`
- `magenta`
- `green`
- `yellow`
- `red`
- `plain`

---

## Pro License Activation

Unlock watermark removal and custom font packs by activating your Polar license key:

```bash
ascii-forge comment "HEADER" --license polar_cl_YOUR_POLAR_KEY
```

👉 **[Get Pro License on Polar](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)**

---

Crafted with 💜 by **abteilung83**.
