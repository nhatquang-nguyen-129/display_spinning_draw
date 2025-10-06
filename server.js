import express from "express";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static("public"));

// Đọc port từ .env, nếu không có thì dùng 3000
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

/**
 * Hàm chọn port khả dụng
 */
function startServer(port) {
  const server = app
    .listen(port, () => {
      console.log(`🎉 Server chạy tại: http://localhost:${port}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`⚠️ Port ${port} đã bị chiếm. Thử port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("❌ Lỗi khởi động server:", err);
      }
    });
}

/**
 * API: /spin
 * Trả về ngẫu nhiên 1 dòng trong file participants.csv
 */
app.get("/spin", (req, res) => {
  const results = [];
  const filePath = "./data/participants.csv";

  // Kiểm tra tồn tại
  if (!fs.existsSync(filePath)) {
    return res.json({ result: "❌ Không tìm thấy file participants.csv" });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", () => {
      if (results.length === 0) return res.json({ result: "Không có dữ liệu" });
      const random = results[Math.floor(Math.random() * results.length)];

      // Giả sử trường điện thoại là cột thứ 3
      const phone =
        random[
          "Bố/Mẹ hãy điền Số Điện Thoại đăng ký tham gia chương trình tại đây nhé!"
        ] || "Không có SĐT";

      res.json({ result: phone });
    });
});

// Khởi động server
startServer(DEFAULT_PORT);
