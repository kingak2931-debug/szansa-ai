#!/usr/bin/env python3
"""Synchronizacja projektu fundacji na Pulpit.

Uruchamiany NA KOMPUTERZE użytkownika (nie w chmurze) z katalogu sklonowanego
repozytorium. Buduje/odświeża folder Pulpit/Fundacja_Szansa_AI w układzie 01-07:

    Desktop/Fundacja_Szansa_AI/
    ├── 01_Plan_i_Strategia/            (PLAN.md, README.md)
    ├── 02_Strona_WWW/                  (website/)
    ├── 03_Marketing_i_SocialMedia/     (marketing/)
    ├── 04_Produkty_Cegielkowe_i_Ebook/ (fundraising/)
    ├── 05_Dokumenty_Prawne/            (legal/)
    ├── 06_System_Jarvis/               (jarvis/ wraz z crm/)
    └── 07_Plan_Startowy_Social_i_CRM/  (execution/)

Użycie (Windows / macOS / Linux, wymaga tylko Pythona 3.8+):

    python narzedzia/sync-pulpit.py            # wykrywa Pulpit automatycznie
    python narzedzia/sync-pulpit.py --dest "D:\\Dowolna\\Sciezka"

Typowy cykl pracy po każdej aktualizacji w repozytorium:

    git pull
    python narzedzia/sync-pulpit.py
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

MAPPING = [
    # (źródło w repo, folder docelowy, lista plików | None = cały katalog)
    (".", "01_Plan_i_Strategia", ["PLAN.md", "README.md"]),
    ("website", "02_Strona_WWW", None),
    ("marketing", "03_Marketing_i_SocialMedia", None),
    ("fundraising", "04_Produkty_Cegielkowe_i_Ebook", None),
    ("legal", "05_Dokumenty_Prawne", None),
    ("jarvis", "06_System_Jarvis", None),
    ("execution", "07_Plan_Startowy_Social_i_CRM", None),
]

# Nie kopiujemy na Pulpit: śmieci technicznych ani danych osobowych (RODO!)
EXCLUDE_DIRS = {"__pycache__", ".git", "data", "node_modules"}


def find_desktop() -> Path:
    """Zwraca ścieżkę Pulpitu (Windows/macOS/Linux, także OneDrive i polskie 'Pulpit')."""
    home = Path.home()
    candidates = [
        home / "Desktop",
        home / "Pulpit",
        home / "OneDrive" / "Desktop",
        home / "OneDrive" / "Pulpit",
    ]
    # Linux: XDG może definiować własną ścieżkę Pulpitu
    xdg = home / ".config" / "user-dirs.dirs"
    if xdg.exists():
        for line in xdg.read_text(encoding="utf-8", errors="ignore").splitlines():
            if line.startswith("XDG_DESKTOP_DIR"):
                raw = line.split("=", 1)[1].strip().strip('"').replace("$HOME", str(home))
                candidates.insert(0, Path(raw))
    for c in candidates:
        if c.is_dir():
            return c
    sys.exit("Nie znalazłem Pulpitu — podaj ścieżkę ręcznie: --dest \"C:\\...\\Desktop\"")


def copy_tree(src: Path, dst: Path) -> int:
    """Kopiuje katalog z pominięciem EXCLUDE_DIRS; zwraca liczbę plików."""
    count = 0
    for path in sorted(src.rglob("*")):
        rel = path.relative_to(src)
        if any(part in EXCLUDE_DIRS for part in rel.parts):
            continue
        target = dst / rel
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            count += 1
    return count


def main() -> int:
    parser = argparse.ArgumentParser(description="Synchronizuje projekt fundacji na Pulpit.")
    parser.add_argument("--dest", help="docelowy folder (domyślnie <Pulpit>/Fundacja_Szansa_AI)")
    args = parser.parse_args()

    root = Path(args.dest).expanduser() if args.dest else find_desktop() / "Fundacja_Szansa_AI"
    root.mkdir(parents=True, exist_ok=True)

    total = 0
    for src_name, dst_name, files in MAPPING:
        src = REPO_ROOT / src_name
        dst = root / dst_name
        if not src.exists():
            print(f"  ⚠ pomijam {src_name} (brak w repo)")
            continue
        dst.mkdir(parents=True, exist_ok=True)
        if files:
            for name in files:
                if (src / name).exists():
                    shutil.copy2(src / name, dst / name)
                    total += 1
        else:
            total += copy_tree(src, dst)
        print(f"  ✔ {dst_name}")

    print(f"\nGotowe: {total} plików w {root}")
    print("Ten sam efekt po każdej aktualizacji: git pull && python narzedzia/sync-pulpit.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
