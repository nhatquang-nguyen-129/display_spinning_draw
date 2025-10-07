import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const inputFile = path.join("data", "participants.csv");
const outputFile = path.join("data", "participants_clean.csv");

// 🧩 Cột gốc trong file CSV
const nameField = "Hãy cho KidsPlaza biết đầy đủ Họ và Tên của Bố/Mẹ nha!";
const phoneField = "Bố/Mẹ hãy điền Số Điện Thoại đăng ký tham gia chương trình tại đây nhé!";
const urlField =
  "Còn bây giờ, Bố/Mẹ hãy điền link bài post tham gia Minigame  📸  NHÀ MÌNH SELFIE - NHẬN QUÀ MÊ LY";

// ✅ Regex linh hoạt cho URL Facebook
const fbPattern = /(facebook\.com|fb\.me)/i;

// 🔧 Hàm chuẩn hóa số điện thoại
function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.toString().trim().replace(/\D/g, "");
  if (p.startsWith("84")) p = "0" + p.slice(2);
  if (p.length === 9 && !p.startsWith("0")) p = "0" + p;
  return p;
}

// 🔧 Lấy 3 số cuối
function last3(phone) {
  return phone ? phone.slice(-3) : "???";
}

const seenPhones = new Set();
const validRows = [];

// 🚀 Đọc file gốc và lọc dữ liệu hợp lệ
fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    const name = row[nameField]?.trim();
    const phone = normalizePhone(row[phoneField]);
    const url = row[urlField]?.trim();

    if (!phone || seenPhones.has(phone) || !url || !fbPattern.test(url)) return;
    seenPhones.add(phone);

    validRows.push({ name, phone, url });
  })
  .on("end", async () => {
    if (validRows.length === 0) {
      console.warn("⚠️ Không có dòng hợp lệ nào để ghi ra file!");
      return;
    }

    const finalData = validRows.map((r, i) => {
      const stt = String(i + 1).padStart(3, "0");
      const lastDigits = last3(r.phone);
      return {
        STT: stt,
        Ho_Ten: r.name,
        So_Dien_Thoai: r.phone,
        Ba_So_Cuoi: lastDigits,
        Bai_Dang: r.url,
      };
    });

    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: Object.keys(finalData[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });

    await csvWriter.writeRecords(finalData);
    console.log(`✅ Xử lý xong ${finalData.length} người hợp lệ. File: ${outputFile}`);

    // Log ra console cho dễ test
    finalData.slice(0, 10).forEach((p) =>
      console.log(`${p.STT} | ${p.Ho_Ten} | ${p.Ba_So_Cuoi}`)
    );
  })
  .on("error", (err) => console.error("❌ Lỗi đọc file:", err.message));