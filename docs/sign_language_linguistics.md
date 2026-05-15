# Cẩm nang Phân tích: Ngôn ngữ học và Cách học Ngôn ngữ Ký hiệu

Nhiều người lầm tưởng Ngôn ngữ Ký hiệu (NNKH) chỉ đơn giản là "dùng tay múa may" để diễn đạt một từ tiếng Việt. Thực tế, đây là một ngôn ngữ hình thể 3D phức tạp, có ngữ pháp riêng và không phụ thuộc hoàn toàn vào tiếng Việt nói.

Tài liệu này phân tích chi tiết cách NNKH hoạt động và ứng dụng nó vào việc thiết kế nội dung (Media) cho hệ thống **Sign Language OS**.

---

## 1. Năm thành tố cấu tạo nên một từ (The 5 Parameters)

Trong tiếng Việt, nếu bạn đọc sai thanh điệu (Ví dụ: "Ma" và "Má"), nghĩa của từ sẽ thay đổi. 
Trong NNKH, nếu bạn làm sai **1 trong 5 yếu tố sau**, người khiếm thính sẽ hiểu sai nghĩa hoặc không hiểu gì cả.

### 1.1. Hình dáng tay (Handshape)
- **Định nghĩa:** Cách các ngón tay gập, duỗi, bắt chéo (giống như các chữ cái trong bảng chữ cái).
- **Ví dụ:** Chữ "A" (nắm tay, ngón cái xòe) khác chữ "B" (xòe thẳng 4 ngón, ngón cái gập).

### 1.2. Hướng lòng bàn tay (Palm Orientation)
- **Định nghĩa:** Lòng bàn tay hướng vào trong (về phía người nói), hướng ra ngoài, hướng lên trên hay hướng xuống dưới.
- **Tầm quan trọng:** Chỉ cần lật ngược lòng bàn tay, ý nghĩa đã thay đổi hoàn toàn.

### 1.3. Vị trí (Location)
- **Định nghĩa:** Ký hiệu được thực hiện ở đâu trên cơ thể (Trán, cằm, ngực, hay trong không trung phía trước bụng).
- **Ví dụ:** Ký hiệu "Mẹ" thường đặt ở cằm, trong khi "Cha" thường đặt ở trán (theo chuẩn ASL). Nếu bạn làm đúng hình dáng tay nhưng đặt sai chỗ, từ đó sẽ vô nghĩa.

### 1.4. Chuyển động (Movement)
- **Định nghĩa:** Quỹ đạo của tay (Đi thẳng, lượn sóng, gõ 2 lần, đẩy ra trước).
- **Tầm quan trọng:** Chuyển động thường dùng để phân biệt Danh từ và Động từ. Ví dụ: "Cái ghế" (gõ 2 lần nhỏ) vs "Ngồi xuống" (ấn mạnh 1 lần).

### 1.5. Ký hiệu Phi thủ công (Non-Manual Markers - NMMs) ⚠️ QUAN TRỌNG
Đây là yếu tố 90% người mới học bỏ qua. Nó bao gồm biểu cảm khuôn mặt, khẩu hình miệng, và tư thế cơ thể. Nó đóng vai trò là **Ngữ pháp** của câu.

- **Khẩu hình miệng:** Nhiều từ có ký hiệu tay giống hệt nhau, người khiếm thính phải nhìn nhép miệng để phân biệt bạn đang nói từ gì.
- **Lông mày:** 
  - Nhướng mày lên: Câu hỏi dạng "Có / Không" (Bạn ăn cơm chưa?).
  - Cau mày xuống: Câu hỏi Wh- (Ai, Cái gì, Ở đâu, Khi nào).
- **Cử chỉ đầu/vai:** Gật đầu nhẹ (khẳng định), lắc đầu (phủ định), hơi rướn người về phía trước.

---

## 2. Phân biệt: Đánh vần (Fingerspelling) vs. Từ vựng nguyên khối

Hệ thống của chúng ta chia làm 2 phần rõ rệt dựa trên thực tế giao tiếp của người khiếm thính:

### A. Đánh vần từng chữ (Alphabet Fingerspelling)
- **Cách dùng:** Dành cho Tên riêng (Tên người, tên thành phố), tên thương hiệu, hoặc các thuật ngữ chuyên ngành quá mới chưa có ký hiệu chuẩn.
- **Đặc điểm:** Tốc độ rất nhanh, chỉ dùng bàn tay.
- **Ưu điểm của Sign Language OS:** Cỗ máy `Translate Engine` của chúng ta mô phỏng y hệt tư duy này. Nếu user gõ một từ chưa có trong Database, máy sẽ "đánh vần" từ đó.

### B. Từ vựng nguyên khối (Vocabulary)
- **Cách dùng:** 95% thời gian giao tiếp, họ dùng từ vựng nguyên khối (Ví dụ: Từ "Cảm ơn" có 1 ký hiệu duy nhất, thay vì phải đánh vần C-Ả-M-Ơ-N).
- **Đặc điểm:** Nhanh gọn, chứa đựng cả 5 yếu tố (đặc biệt là biểu cảm khuôn mặt).

---

## 3. Ứng dụng vào UX/UI và Media của Dự án

Từ phân tích trên, chúng ta rút ra cẩm nang sản xuất Media cho app:

> [!WARNING]
> **Khung hình chuẩn cho Video Từ điển:**
> Tuyệt đối không chỉ quay mỗi bàn tay. Video từ điển phải được crop ở khung hình **Mid-shot (Từ đỉnh đầu đến rốn)**. Phải thấy rõ khuôn mặt người mẫu để quan sát Khẩu hình miệng và Lông mày.

> [!TIP]
> **Khung hình chuẩn cho Bảng chữ cái:**
> Chỉ cần quay/chụp cận cảnh bàn tay (Close-up). Hình ảnh cần rõ nét để thấy sự đan chéo của các ngón tay. Lưới ảnh tĩnh (Multi-angle) là cực kỳ hữu ích ở đây.

> [!NOTE]
> **Tính năng Xoay 3D (Tương lai):**
> Vì NNKH có yếu tố "Hướng lòng bàn tay" và "Chuyển động", việc tích hợp Mô hình 3D (Phase 5) trên app sẽ là một tính năng "Killer Feature" (Tính năng ăn tiền), giúp user có thể cầm chuột xoay để nhìn ký hiệu từ phía sau lưng hoặc bên hông.
