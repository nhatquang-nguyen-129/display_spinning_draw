import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const inputFile = path.join("data", "participants.csv");
const outputFile = path.join("data", "participants_clean.csv");

// 🧩 Original column names in the input CSV
const nameField = "Full Name";
const phoneField = "Phone Number";
const urlField = "Facebook Post";

// ✅ Flexible Facebook URL pattern
const fbPattern = /(facebook\.com|fb\.me)/i;

// 🔧 Normalize phone number format
function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.toString().trim().replace(/\D/g, "");
  if (p.startsWith("84")) p = "0" + p.slice(2);
  if (p.length === 9 && !p.startsWith("0")) p = "0" + p;
  return p;
}

// 🔧 Get last 3 digits of phone number
function last3(phone) {
  return phone ? phone.slice(-3) : "???";
}

// 🔧 Convert string to Title Case
function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// 🆕 🔧 Extract name part for Quick_Spin
function getQuickSpinName(fullName) {
  if (!fullName) return "";
  const parts = fullName
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean);
  const n = parts.length;

  if (n === 1) return toTitleCase(parts[0]);
  if (n === 2) return toTitleCase(parts[1]);

  if (n === 3) {
    if (parts[1] === "thị") return toTitleCase(parts[2]);
    else return toTitleCase(parts.slice(1).join(" "));
  }

  if (n >= 4) return toTitleCase(parts.slice(-2).join(" "));
  return toTitleCase(parts.slice(-1)[0]);
}

// Temporary array to hold all rows
const allRows = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on("data", (row) => {
    const name = row[nameField]?.trim();
    const phone = normalizePhone(row[phoneField]);
    const url = row[urlField]?.trim();

    // ✅ Skip invalid rows early
    if (!phone || !url || !fbPattern.test(url)) return;

    allRows.push({ name, phone, url });
  })
  .on("end", async () => {
    if (allRows.length === 0) {
      console.warn("⚠️ Không có dòng hợp lệ nào để xử lý!");
      return;
    }

    // 🧹 Step 1: Remove duplicate phone numbers
    const uniqueMap = new Map();
    const duplicates = []; // ✅ store duplicates for logging

    for (const row of allRows) {
      if (!uniqueMap.has(row.phone)) {
        uniqueMap.set(row.phone, row);
      } else {
        duplicates.push(row); // duplicate found → save for reporting
      }
    }

    const validRows = Array.from(uniqueMap.values());

    // 🧾 Step 2: Prepare final output
    const finalData = validRows.map((r, i) => {
      const stt = String(i + 1).padStart(3, "0");
      const lastDigits = last3(r.phone);
      const nameTitleCase = toTitleCase(r.name);
      const shortName = getQuickSpinName(r.name);
      const quickSpin = `${stt} - ${shortName} - ${lastDigits}`; // ✅ Format mới

      return {
        STT: stt,
        Ho_Ten: nameTitleCase,
        So_Dien_Thoai: r.phone,
        Ba_So_Cuoi: lastDigits,
        Bai_Dang: r.url,
        Quick_Spin: quickSpin, // 🆕 thêm trường mới
      };
    });

    // ✍️ Step 3: Write to CSV file
    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: Object.keys(finalData[0]).map((key) => ({
        id: key,
        title: key,
      })),
    });

    await csvWriter.writeRecords(finalData);

    // ✅ Print summary
    console.log(
      `✅ Giữ lại ${finalData.length} người hợp lệ (đã loại ${duplicates.length} bản trùng).`
    );
    console.log(`📄 File output: ${outputFile}`);

    // 🔍 Print duplicates summary
    if (duplicates.length > 0) {
      console.log("\n⚠️ Các bản bị loại do trùng số điện thoại:");
      duplicates.forEach((d, idx) => {
        console.log(
          `${String(idx + 1).padStart(3, "0")} | ${toTitleCase(d.name)} | ${d.phone}`
        );
      });
    } else {
      console.log("\n✅ Không có bản trùng nào bị loại.");
    }
  })
  .on("error", (err) => console.error("❌ Lỗi đọc file:", err.message));
