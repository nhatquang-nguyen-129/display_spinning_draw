import express from "express";
import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static("public"));

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 🔹 Load CSV vào memory
let participants = [];
const filePath = "./data/participants_clean.csv";
if (fs.existsSync(filePath)) {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", row => participants.push(row))
    .on("end", () => console.log("✅ CSV loaded:", participants.length));
}

// 🔹 File lưu winners để loại trừ
const winnersFile = "./data/winners.json";
let winners = [];
if (fs.existsSync(winnersFile)) {
  winners = JSON.parse(fs.readFileSync(winnersFile, "utf-8"));
}

function saveWinners() {
  fs.writeFileSync(winnersFile, JSON.stringify(winners, null, 2));
}

app.get("/spin", (req, res) => {
  const eligible = participants.filter(p => !winners.includes(p["STT"]));

  if (!eligible.length)
    return res.status(404).json({ error: "Đã quay hết tất cả người tham gia!" });

  const random = eligible[Math.floor(Math.random() * eligible.length)];

  // 🔹 Thêm vào danh sách đã quay
  winners.push(random["STT"]);
  saveWinners();

  res.json({
    stt: random["STT"],
    hoTen: random["Ho_Ten"],
    baSoCuoi: random["Ba_So_Cuoi"],
  });
});

function startServer(port) {
  app.listen(port, () => console.log(`🎉 Server chạy tại: http://localhost:${port}`))
     .on("error", err => {
       if (err.code === "EADDRINUSE") startServer(port + 1);
       else console.error(err);
     });
}

startServer(DEFAULT_PORT);