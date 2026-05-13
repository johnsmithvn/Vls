"""
Generate placeholder SVG images for Vietnamese sign language alphabet.
These are visual placeholders showing the hand shape description.
Run: node scripts/generate_alphabet_svgs.js (or use Python below)
"""

import os

ALPHABET = [
    ("A", "Nắm tay, ngón cái sang ngang", "#6366f1"),
    ("Ă", "Giống A, thêm dấu trăng", "#6366f1"),
    ("Â", "Giống A, thêm dấu mũ", "#6366f1"),
    ("B", "Bàn tay mở, ngón cái gập", "#8b5cf6"),
    ("C", "Bàn tay cong hình chữ C", "#8b5cf6"),
    ("D", "Ngón trỏ thẳng, còn lại nắm", "#a78bfa"),
    ("Đ", "Giống D, ngón trỏ gạch ngang", "#a78bfa"),
    ("E", "Các ngón gập tạo hình E", "#7c3aed"),
    ("Ê", "Giống E, thêm dấu mũ", "#7c3aed"),
    ("G", "Ngón trỏ + cái chỉ ngang", "#6d28d9"),
    ("H", "Hai ngón trỏ + giữa thẳng", "#6d28d9"),
    ("I", "Ngón út thẳng, còn lại nắm", "#5b21b6"),
    ("K", "Ngón trỏ + giữa chữ V, cái chạm giữa", "#4f46e5"),
    ("L", "Ngón cái + trỏ thẳng góc 90°", "#4f46e5"),
    ("M", "Ba ngón gập trên ngón cái", "#4338ca"),
    ("N", "Hai ngón gập trên ngón cái", "#4338ca"),
    ("O", "Các ngón chạm cái tạo hình O", "#3730a3"),
    ("Ô", "Giống O, thêm dấu mũ", "#3730a3"),
    ("Ơ", "Giống O, thêm dấu móc", "#3730a3"),
    ("P", "Giống K, úp xuống", "#312e81"),
    ("Q", "Giống G, úp xuống", "#312e81"),
    ("R", "Ngón trỏ + giữa bắt chéo", "#6366f1"),
    ("S", "Nắm tay, ngón cái phía trước", "#8b5cf6"),
    ("T", "Ngón cái kẹp giữa trỏ + giữa", "#a78bfa"),
    ("U", "Ngón trỏ + giữa thẳng sát nhau", "#7c3aed"),
    ("Ư", "Giống U, thêm dấu móc", "#7c3aed"),
    ("V", "Ngón trỏ + giữa xòe hình V", "#6d28d9"),
    ("X", "Ngón trỏ gập hình móc câu", "#5b21b6"),
    ("Y", "Ngón cái + út xòe, còn lại nắm", "#4f46e5"),
]

# Map Vietnamese letters to safe filenames
FILENAME_MAP = {
    "Ă": "a_breve",
    "Â": "a_circumflex",
    "Đ": "d_stroke",
    "Ê": "e_circumflex",
    "Ô": "o_circumflex",
    "Ơ": "o_horn",
    "Ư": "u_horn",
}

def letter_to_filename(letter: str) -> str:
    """Convert letter to safe filename."""
    return FILENAME_MAP.get(letter, letter.lower())


def generate_svg(letter: str, mnemonic: str, color: str) -> str:
    """Generate a clean, modern SVG placeholder for an alphabet letter."""
    # Wrap mnemonic text for SVG (simple word-wrap)
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

    # Build text elements for mnemonic
    text_y_start = 200
    mnemonic_elements = ""
    for i, line in enumerate(lines):
        y = text_y_start + (i * 22)
        mnemonic_elements += f'    <text x="160" y="{y}" font-family="system-ui, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">{line}</text>\n'

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="bg_{letter_to_filename(letter)}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f3ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ede9fe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="24" fill="url(#bg_{letter_to_filename(letter)})"/>
  <circle cx="160" cy="100" r="60" fill="{color}" opacity="0.12"/>
  <text x="160" y="120" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="{color}" text-anchor="middle" dominant-baseline="middle">{letter}</text>
  <text x="160" y="170" font-family="system-ui, sans-serif" font-size="11" fill="{color}" text-anchor="middle" opacity="0.7">Ký hiệu ngôn ngữ ký hiệu</text>
{mnemonic_elements}  <rect x="110" y="270" width="100" height="28" rx="14" fill="{color}" opacity="0.1"/>
  <text x="160" y="288" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="{color}" text-anchor="middle">🤟 Xem chi tiết</text>
</svg>'''


def main():
    # Path: D:\Development\Workspace\VLS\apps\api\scripts\generate_alphabet_svgs.py
    # We want to go up to VLS root, then into apps\web\public\signs\alphabet
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "web", "public", "signs", "alphabet",
    )
    os.makedirs(output_dir, exist_ok=True)

    for letter, mnemonic, color in ALPHABET:
        filename = f"{letter_to_filename(letter)}.svg"
        filepath = os.path.join(output_dir, filename)
        svg_content = generate_svg(letter, mnemonic, color)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)

        print(f"  [OK] {filename}")

    print(f"\nGenerated {len(ALPHABET)} SVG placeholders in {output_dir}")


if __name__ == "__main__":
    main()
