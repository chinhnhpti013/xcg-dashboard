# BÁO CÁO TIẾN TRÌNH BỒI THƯỜNG

bạn hãy dùng skill /skill-creator để tạo cho tôi các mẫu báo cáo tiến trình bồi thường

---

## 1. Báo cáo THỐNG KÊ HỒ SƠ TIẾP NHẬN, GIẢI QUYẾT VÀ TỒN (XO)

Định dạng số liệu xuất ra dạng bảng, bao gồm các cột:

| Stt | Mã GĐV | Đã giải quyết cả tồn năm trước chuyển sang | Đang giải quyết bồi thường | Tỷ lệ HS tồn/∑ số HS nhận | 1. HS tồn <=45 ngày | 2. HS tồn trên 45 ngày | 3. Tỷ lệ HS tồn trên 45 ngày/ ∑ HS tồn |
|-----|--------|-------------------------------------------|-----------------------------|---------------------------|---------------------|------------------------|------------------------------------------|

### Logic tính toán

- **Cột 1 – "Stt"**: Đếm theo thứ tự GĐV.

- **Cột 2 – "Mã GĐV"**: Số liệu tổng hợp theo từng Mã GĐV (giám định viên):
  - `TUNGHX` : Hoàng Xuân Tùng
  - `TUYENLM` : Lương Minh Tuyến
  - `CHINH05` : Nguyễn Hồng Chinh
  - `DUYNT` : Nguyễn Thế Duy
  - `VIETNT05` : Nguyễn Tiến Việt
  - `HUONGNV` : Nguyễn Văn Hướng
  - `SONTT` : Trần Thanh Sơn

- **Cột 3 – "Đã giải quyết cả tồn năm trước chuyển sang"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Trạng thái hồ sơ** = `"Đã thanh toán"` hoặc = `"Đã hủy"`, tương ứng với từng Mã GĐV.

- **Cột 4 – "Đang giải quyết bồi thường"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Số ngày tồn** > 0, tương ứng với từng Mã GĐV.

- **Cột 5 – "Tỷ lệ HS tồn/∑ số HS nhận"**: = Cột 4 / (Cột 3 + Cột 4) — định dạng theo tỷ lệ %, tương ứng với từng Mã GĐV.

- **Cột 6 – "1. HS tồn <=45 ngày"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Số ngày tồn** <> 0 đồng thời **Số ngày tồn** <= 45, tương ứng với từng Mã GĐV.

- **Cột 7 – "2. HS tồn trên 45 ngày"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Số ngày tồn** > 45, tương ứng với từng Mã GĐV.

- **Cột 8 – "3. Tỷ lệ HS tồn trên 45 ngày/ ∑ HS tồn"**: = Cột 7 / Cột 4 — định dạng theo tỷ lệ %, tương ứng với từng Mã GĐV.

---

## 2. Báo cáo TỔNG HỢP HỒ SƠ TỒN (NV XO)

Bố cục báo cáo dạng bảng:

- **Cột 1 – "Stt"**: Đếm theo thứ tự GĐV.

- **Cột 2 – "Mã GĐV"**: Tổng hợp số liệu theo từng Mã GĐV.

- **Cột 3 – "Tổng số HSBT cần giải quyết"**:
  - **Cột 3.1 – "Tồn năm trước chuyển sang"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Ngày mở HSBT** <= ngày 31 tháng 12 năm trước liền kề năm hiện tại, tương ứng với từng Mã GĐV.
  - **Cột 3.2 – "HSPS kỳ báo cáo"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Ngày mở HSBT** >= ngày 01 tháng 01 năm hiện tại, tương ứng với từng Mã GĐV.
  - **Cột 3.3 – "Tổng số HS cần giải quyết"**: = (Cột 3.1 + Cột 3.2), tương ứng với từng Mã GĐV.

- **Cột 4 – "Đã giải quyết trong kỳ"**: Ánh xạ file `Dulieu.xlsx` — đếm số lượng cột có tiêu đề **Số HSBT** với điều kiện cột **Trạng thái hồ sơ** = `"Đã thanh toán"` hoặc = `"Đã hủy"`, tương ứng với từng Mã GĐV.

- **Cột 5 – "Tồn chưa giải quyết"**:
  - **Cột 5.1 – "Tồn theo ngày PSHS"**:
    - **Cột 5.1.1 – "Từ 0 - 30 ngày"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** <> 0 và **Số ngày tồn** <= 30.
    - **Cột 5.1.2 – "Từ 30 - 45 ngày"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** > 30 và **Số ngày tồn** <= 45.
    - **Cột 5.1.3 – "45 =< Tồn < 90 ngày"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** >= 45 và **Số ngày tồn** < 90.
    - **Cột 5.1.4 – "Tồn > 90 ngày"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** > 90.
  - **Cột 5.2 – "Tồn theo NV"**:
    - **Cột 5.2.1 – "TNDS"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** > 0 và **Mã nghiệp vụ** = `"XO.1.1.1"` hoặc `"XO.1.1.2"`, tương ứng với từng Mã GĐV.
    - **Cột 5.2.2 – "VCX"**: Ánh xạ file `Dulieu.xlsx` — điều kiện **Số ngày tồn** > 0 và **Mã nghiệp vụ** = `"XO.4.1.1"`, tương ứng với từng Mã GĐV.
  - **Cột 5.3 – "Tổng số"**: = (Cột 5.2.1 + Cột 5.2.2), tương ứng với từng Mã GĐV.

- **Cột 6 – "Hs tồn/Hs PS TB tháng"**: = Cột 5.3 / (Cột 3.2 / số nguyên tháng hiện tại)  (định dạng tỷ lệ %.)

- **Cột 7 – "Cảnh báo"**:
  - Nếu tỷ lệ % < 80% → `"Cấp độ 1"`
  - Nếu tỷ lệ % > 80% và < 130% → `"Cấp độ 2"`
  - Nếu tỷ lệ % > 130% → `"Cấp độ 3"`

> 
