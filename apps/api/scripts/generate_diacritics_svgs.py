"""
Generate placeholder SVG images for Vietnamese diacritical marks.
Covers: 4 letter modifiers + 5 tone marks = 9 total.
"""

import os

DIACRITICS = [
    # Letter modifiers
    ("dau_mu",    "Dau mu (^)",     "A->A, E->E, O->O",  "Ngon tro ve hinh tam giac",   "#8b5cf6", "^"),
    ("dau_trang", "Dau trang",      "A->A (breve)",       "Ngon tro ve hinh cung tron",  "#7c3aed", "\u02d8"),
    ("dau_moc",   "Dau moc",        "O->O, U->U (horn)",  "Ngon tro ve net moc ben phai","#6d28d9", "\u031b"),
    ("dau_gach",  "Dau gach ngang", "D->D (stroke)",      "Ngon tro gach ngang qua",     "#5b21b6", "\u2014"),
    # Tone marks
    ("dau_sac",   "Dau sac",        "a -> a (acute)",     "Ngon tro vach cheo len /",    "#ef4444", "\u00b4"),
    ("dau_huyen", "Dau huyen",      "a -> a (grave)",     "Ngon tro vach cheo xuong \\", "#f97316", "`"),
    ("dau_hoi",   "Dau hoi",        "a -> a (hook)",      "Ngon tro ve dau hoi ?",       "#eab308", "?"),
    ("dau_nga",   "Dau nga",        "a -> a (tilde)",     "Ngon tro ve hinh song ~",     "#22c55e", "~"),
    ("dau_nang",  "Dau nang",       "a -> a (dot below)", "Ngon tro cham xuong 1 diem",  "#3b82f6", "\u2022"),
]


def generate_diacritic_svg(name, display_name, applies, gesture, color, symbol):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="bg_{name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#faf5ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f3e8ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="24" fill="url(#bg_{name})"/>
  <circle cx="160" cy="95" r="55" fill="{color}" opacity="0.12"/>
  <text x="160" y="115" font-family="system-ui, sans-serif" font-size="56" font-weight="bold" fill="{color}" text-anchor="middle" dominant-baseline="middle">{symbol}</text>
  <text x="160" y="170" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="{color}" text-anchor="middle">{display_name}</text>
  <text x="160" y="200" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">{applies}</text>
  <rect x="30" y="230" width="260" height="50" rx="12" fill="{color}" opacity="0.08"/>
  <text x="160" y="260" font-family="system-ui, sans-serif" font-size="11" fill="{color}" text-anchor="middle">{gesture}</text>
</svg>'''


def main():
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "web", "public", "signs", "diacritics",
    )
    os.makedirs(output_dir, exist_ok=True)

    for name, display_name, applies, gesture, color, symbol in DIACRITICS:
        filepath = os.path.join(output_dir, f"{name}.svg")
        svg = generate_diacritic_svg(name, display_name, applies, gesture, color, symbol)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg)
        print(f"  [OK] {name}.svg")

    print(f"\nGenerated {len(DIACRITICS)} diacritic SVGs in {output_dir}")


if __name__ == "__main__":
    main()
