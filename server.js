import express from "express";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static("public"));

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

/** 📜 Lấy toàn bộ danh sách (phục vụ hiệu ứng quay giả) */
app.get("/participants", (req, res) => {
  const results = [];
  const filePath = "./data/participants_clean.csv";
  if (!fs.existsSync(filePath)) return res.json([]);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      results.push({
        stt: row["STT"],
        hoTen: row["Ho_Ten"],        // 👈 sửa thành Ho_Ten
        baSoCuoi: row["Ba_So_Cuoi"],
      });
    })
    .on("end", () => res.json(results));
});

/** 🎲 Quay thật — random 1 người hợp lệ */
app.get("/spin", (req, res) => {
  const results = [];
  const filePath = "./data/participants_clean.csv";
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Không tìm thấy file dữ liệu!" });
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", () => {
      if (!results.length) return res.json({ error: "Không có dữ liệu" });
      const random = results[Math.floor(Math.random() * results.length)];

      res.json({
        stt: random["STT"],
        hoTen: random["Ho_Ten"],     // 👈 sửa thành Ho_Ten
        baSoCuoi: random["Ba_So_Cuoi"],
      });
    });
});

startServer(DEFAULT_PORT);
