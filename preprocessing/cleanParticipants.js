// preprocessing/cleanParticipants.js
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const inputFile = path.join("data", "participants.csv");
const outputFile = path.join("data", "participants_clean.csv");

// 🧩 Các cột trong file CSV — kiểm tra trùng 100% với file thật
const phoneField = "Bố/Mẹ hãy điền Số Điện Thoại đăng ký tham gia chương trình tại đây nhé!";
const nameField = "Hãy cho KidsPlaza biết đầy đủ Họ và Tên của Bố/Mẹ nha!";
const urlField = "Còn bây giờ, Bố/Mẹ hãy điền link bài post tham gia Minigame  📸  NHÀ MÌNH SELFIE - NHẬN QUÀ MÊ LY";

// 🔎 Regex kiểm tra URL Facebook (đã mở rộng để nhận m.facebook.com, web.facebook.com,...)
const fbPattern = /^https?:\/\/([a-zA-Z0-9]+\.)?(facebook\.com|fb\.me)/i;

// 📱 Chuẩn hóa số điện thoại
function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.toString().trim().replace(/\D/g, "");
  if (p.startsWith("84")) p = "0" + p.slice(2);
  if (p.length === 9 && !p.startsWith("0")) p = "0" + p;
  return p;
}

// 🔢 Lấy 3 số cuối SDT
function last3(phone) {
  return phone ? phone.slice(-3) : "???";
}

const seenPhones = new Set();
const validRows = [];

// 📂 Đọc file CSV gốc
fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    const name = row[nameField]?.trim();
    const phone = normalizePhone(row[phoneField]);
    const url = row[urlField]?.trim();

    // Chỉ nhận dòng hợp lệ
    if (!phone || seenPhones.has(phone) || !fbPattern.test(url)) return;

    seenPhones.add(phone);
    validRows.push({ name, phone, url });
  })
  .on("end", async () => {
    console.log(`📊 Đã đọc ${validRows.length} dòng hợp lệ.`);

    const finalData = validRows.map((r, i) => {
      const stt = String(i + 1).padStart(3, "0");
      const lastDigits = last3(r.phone);
      const display = `${stt} - ${r.name} - *${lastDigits}`;
      return {
        STT: stt,
        Họ_Tên: r.name,
        Số_Điện_Thoại: r.phone,
        Bài_Đăng: r.url,
        Hiển_Thị: display,
      };
    });

    if (finalData.length === 0) {
      console.error("❌ Không có dữ liệu hợp lệ. Kiểm tra tên cột hoặc URL Facebook.");
      return;
    }

    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: Object.keys(finalData[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });

    await csvWriter.writeRecords(finalData);
    console.log(`✅ Xử lý xong ${finalData.length} người hợp lệ. File: ${outputFile}`);
  })
  .on("error", (err) => console.error("❌ Lỗi đọc file:", err.message));
