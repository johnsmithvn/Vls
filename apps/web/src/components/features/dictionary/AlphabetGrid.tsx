"use client";

import { FlipCard } from "./FlipCard";

// Vietnamese Sign Language alphabet (29 letters)
const ALPHABET = [
  { letter: "A", mnemonic: "Nắm tay, ngón cái sang ngang" },
  { letter: "Ă", mnemonic: "Giống A, thêm dấu trăng" },
  { letter: "Â", mnemonic: "Giống A, thêm dấu mũ" },
  { letter: "B", mnemonic: "Bàn tay mở, ngón cái gập" },
  { letter: "C", mnemonic: "Bàn tay cong hình chữ C" },
  { letter: "D", mnemonic: "Ngón trỏ thẳng, còn lại nắm" },
  { letter: "Đ", mnemonic: "Giống D, ngón trỏ gạch ngang" },
  { letter: "E", mnemonic: "Các ngón gập tạo hình E" },
  { letter: "Ê", mnemonic: "Giống E, thêm dấu mũ" },
  { letter: "G", mnemonic: "Ngón trỏ + cái chỉ ngang" },
  { letter: "H", mnemonic: "Hai ngón trỏ + giữa thẳng" },
  { letter: "I", mnemonic: "Ngón út thẳng, còn lại nắm" },
  { letter: "K", mnemonic: "Ngón trỏ + giữa chữ V, cái chạm giữa" },
  { letter: "L", mnemonic: "Ngón cái + trỏ thẳng góc 90°" },
  { letter: "M", mnemonic: "Ba ngón gập trên ngón cái" },
  { letter: "N", mnemonic: "Hai ngón gập trên ngón cái" },
  { letter: "O", mnemonic: "Các ngón chạm cái tạo hình O" },
  { letter: "Ô", mnemonic: "Giống O, thêm dấu mũ" },
  { letter: "Ơ", mnemonic: "Giống O, thêm dấu móc" },
  { letter: "P", mnemonic: "Giống K, úp xuống" },
  { letter: "Q", mnemonic: "Giống G, úp xuống" },
  { letter: "R", mnemonic: "Ngón trỏ + giữa bắt chéo" },
  { letter: "S", mnemonic: "Nắm tay, ngón cái phía trước" },
  { letter: "T", mnemonic: "Ngón cái kẹp giữa trỏ + giữa" },
  { letter: "U", mnemonic: "Ngón trỏ + giữa thẳng sát nhau" },
  { letter: "Ư", mnemonic: "Giống U, thêm dấu móc" },
  { letter: "V", mnemonic: "Ngón trỏ + giữa xòe hình V" },
  { letter: "X", mnemonic: "Ngón trỏ gập hình móc câu" },
  { letter: "Y", mnemonic: "Ngón cái + út xòe, còn lại nắm" },
];

export function AlphabetGrid() {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight">
        🤟 Bảng chữ cái liên tưởng
      </h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
        {ALPHABET.map((item) => (
          <FlipCard
            key={item.letter}
            letter={item.letter}
            mnemonic={item.mnemonic}
          />
        ))}
      </div>
    </section>
  );
}
