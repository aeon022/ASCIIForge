# asciiphreak tutorial

Every command below is copy-and-paste. New to the terminal? Run **`asciiphreak wizard`**: it asks a few questions, shows you the command and runs it.

## 1. Install

```bash
npm install -g asciiphreak
```

Try without installing: `npx asciiphreak demo`.

## 2. Your first banner

```bash
asciiphreak text "Hello" -f slant -c neon
asciiphreak text "Hello" -c "#ff0080,#00f0ff" --border round
```

Colours: `neon fire rainbow cyan magenta green yellow red plain`, a hex colour, or a gradient `"#from,#to"` (`--direction horizontal|vertical|diagonal`).

## 3. A comment block for your source code

```bash
asciiphreak comment "CORE UTILS" -L ts
asciiphreak comment "DATA PIPELINE" -L python
asciiphreak comment "NAVIGATION" -L html
asciiphreak languages          # all 25+ languages
```

Put it straight into a file (top, bottom or a line number); `--tag` makes a re-run replace the block instead of adding another:

```bash
asciiphreak comment "MY APP" --insert src/app.js --tag header
```

## 4. Print a banner when your app starts

```bash
asciiphreak snippet "MY APP" -L js      # js ts python go rust shell
asciiphreak motd "MY SERVER"            # login banner with host, system, uptime
```

## 5. Fonts

```bash
asciiphreak fonts block --preview       # fonts containing "block", drawn
asciiphreak text "Hello" -f random      # surprise me
```

## 6. Save it

```bash
asciiphreak text "MY APP" -o banner.txt   # also .svg .html .md
asciiphreak text "MY APP" --copy          # to the clipboard
```

## 7. Glitch effect

```bash
asciiphreak text "SIGNAL LOST" --glitch 0.3 --seed 7
```

## 8. Project defaults

```bash
asciiphreak init     # writes .asciiphreakrc.json (font, colour, language …)
```

Personal defaults for every project: `~/.config/asciiphreak/defaults.json`.

## Pro licence

Free: everything. Without a licence, **comment blocks** carry a small "Crafted with asciiphreak" line. A Pro licence removes it:

```bash
asciiphreak license <your-key>
asciiphreak license --status
```

👉 [Get asciiphreak Pro on Polar](https://buy.polar.sh/polar_cl_bicrfkUYm0tKq6steUcsbooPO6v02OBbe96lA4WqqSS)
