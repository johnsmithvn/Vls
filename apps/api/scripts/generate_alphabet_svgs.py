"""
Generate placeholder SVG images for Vietnamese sign language alphabet.
Only 22 base Latin letters (no composite characters).
Run: python scripts/generate_alphabet_svgs.py
"""

import os

ALPHABET = [
    ("A", "Nam tay, ngon cai sang ngang", "#6366f1"),
    ("B", "Ban tay mo, ngon cai gap", "#8b5cf6"),
    ("C", "Ban tay cong hinh chu C", "#8b5cf6"),
    ("D", "Ngon tro thang, con lai nam", "#a78bfa"),
    ("E", "Cac ngon gap tao hinh E", "#7c3aed"),
    ("G", "Ngon tro + cai chi ngang", "#6d28d9"),
    ("H", "Hai ngon tro + giua thang", "#6d28d9"),
    ("I", "Ngon ut thang, con lai nam", "#5b21b6"),
    ("K", "Ngon tro + giua chu V", "#4f46e5"),
    ("L", "Ngon cai + tro thang goc 90", "#4f46e5"),
    ("M", "Ba ngon gap tren ngon cai", "#4338ca"),
    ("N", "Hai ngon gap tren ngon cai", "#4338ca"),
    ("O", "Cac ngon cham cai tao hinh O", "#3730a3"),
    ("P", "Giong K, up xuong", "#312e81"),
    ("Q", "Giong G, up xuong", "#312e81"),
    ("R", "Ngon tro + giua bat cheo", "#6366f1"),
    ("S", "Nam tay, ngon cai phia truoc", "#8b5cf6"),
    ("T", "Ngon cai kep giua tro + giua", "#a78bfa"),
    ("U", "Ngon tro + giua thang sat nhau", "#7c3aed"),
    ("V", "Ngon tro + giua xoe hinh V", "#6d28d9"),
    ("X", "Ngon tro gap hinh moc cau", "#5b21b6"),
    ("Y", "Ngon cai + ut xoe, con lai nam", "#4f46e5"),
]


def generate_svg(letter: str, mnemonic: str, color: str) -> str:
    """Generate a clean, modern SVG placeholder for an alphabet letter."""
    words = mnemonic.split()
    lines = []
    current_line = ""
    for word in words:
        test = f"{current_line} {word}".strip()
        if len(test) > 20:
            if current_line:
                lines.append(current_line)
            current_line = word
        else:
            current_line = test
    if current_line:
        lines.append(current_line)

    text_y_start = 200
    mnemonic_elements = ""
    for i, line in enumerate(lines):
        y = text_y_start + (i * 22)
        mnemonic_elements += f'    <text x="160" y="{y}" font-family="system-ui, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">{line}</text>\n'

    safe = letter.lower()
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="bg_{safe}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f3ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ede9fe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="24" fill="url(#bg_{safe})"/>
  <circle cx="160" cy="100" r="60" fill="{color}" opacity="0.12"/>
  <text x="160" y="120" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="{color}" text-anchor="middle" dominant-baseline="middle">{letter}</text>
  <text x="160" y="170" font-family="system-ui, sans-serif" font-size="11" fill="{color}" text-anchor="middle" opacity="0.7">Ky hieu ngon ngu ky hieu</text>
{mnemonic_elements}  <rect x="110" y="270" width="100" height="28" rx="14" fill="{color}" opacity="0.1"/>
  <text x="160" y="288" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="{color}" text-anchor="middle">Xem chi tiet</text>
</svg>'''


def main():
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "web", "public", "signs", "alphabet",
    )
    os.makedirs(output_dir, exist_ok=True)

    for letter, mnemonic, color in ALPHABET:
        filename = f"{letter.lower()}.svg"
        filepath = os.path.join(output_dir, filename)
        svg_content = generate_svg(letter, mnemonic, color)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)

        print(f"  [OK] {filename}")

    print(f"\nGenerated {len(ALPHABET)} SVG placeholders in {output_dir}")


if __name__ == "__main__":
    main()
