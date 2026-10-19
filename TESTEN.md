# asciiphreak ausprobieren — Schritt für Schritt

Alles in das Terminal (Kitty) kopieren, mit Enter bestätigen. Zeilen mit `#` sind nur Erklärungen.

## 1. Installieren (einmalig)

```bash
npm install -g asciiphreak
```

## 2. Prüfen, ob es klappt

```bash
asciiphreak --version
asciiphreak demo
```

## 3. Der Assistent (empfohlen)

```bash
asciiphreak wizard
```

Er fragt dich Schritt für Schritt, zeigt dir den fertigen Befehl zum Merken und führt ihn aus. Enter nimmt jeweils den Vorschlag in den eckigen Klammern; Strg+C bricht ab.

## 4. Ein eigener Befehl

```bash
asciiphreak text "Hallo" -c neon --border round
```


## 5. Hilfe

```bash
asciiphreak --help
asciiphreak <befehl> --help
```

Mehr Rezepte: [TUTORIAL.md](TUTORIAL.md).
