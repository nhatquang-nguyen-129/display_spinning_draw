function showFireworks(durationMs = 10000) {
  const canvas = document.getElementById("fireworks-container");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fireworks = [];
  const particles = [];
  const colors = ["#ff00ff","#ffd700","#00ffff","#ff4500","#7fffd4","#ffffff","#ff1493","#ffa500"];

  const endTime = Date.now() + durationMs;

  function spawnFirework() {
    const startX = canvas.width / 2 + (Math.random() - 0.5) * 400;
    const startY = canvas.height + 10;
    const side = Math.random() < 0.5 ? 1 : -1;
    const angle = Math.PI / 2 + side * (Math.random() * Math.PI / 4);
    const speed = 14 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];

    fireworks.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: -Math.abs(Math.sin(angle) * speed),
      color,
      exploded: false,
      alpha: 1,
      tail: [],
    });
  }

  function explode(x, y, color) {
    const numParticles = 35 + Math.floor(Math.random() * 15);
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * 2 * Math.PI;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 80 + Math.random() * 40,
        radius: 1.5 + Math.random() * 1.5,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach(f => {
      f.tail.push({ x: f.x, y: f.y });
      if (f.tail.length > 5) f.tail.shift();

      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.15;
      f.alpha -= 0.0045;

      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < f.tail.length - 1; i++) {
        ctx.globalAlpha = i / f.tail.length;
        ctx.moveTo(f.tail[i].x, f.tail[i].y);
        ctx.lineTo(f.tail[i + 1].x, f.tail[i + 1].y);
      }
      ctx.stroke();

      ctx.globalAlpha = f.alpha;
      ctx.fillStyle = f.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      if (f.vy >= 0 && !f.exploded) {
        f.exploded = true;
        explode(f.x, f.y, f.color);
      }
    });

    for (let i = fireworks.length - 1; i >= 0; i--) {
      if (fireworks[i].exploded || fireworks[i].alpha <= 0) fireworks.splice(i, 1);
    }

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.alpha -= 0.013;
      p.life -= 1;

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].alpha <= 0 || particles[i].life <= 0) particles.splice(i, 1);
    }

    if (Date.now() < endTime || particles.length > 0 || fireworks.length > 0) {
      if (Date.now() < endTime && Math.random() < 0.03) {
        const burstCount = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < burstCount; i++) {
          spawnFirework();
        }
      }
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// Hiển thị "Xin chúc mừng Mẹ [Họ Tên]" trên canvas riêng
function showCongrats(name = "Ho_Ten") {
  const canvas = document.getElementById("congrats-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fullText = `Xin chúc mừng Mẹ ${name.toUpperCase()}`;
  const letters = fullText.split("");
  let letterIndex = 0;
  let letterScale = 0;
  const delayBefore = 500;
  const startTime = Date.now();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const offsetX = centerX - ((letters.length - 1) * 20) / 2;
    for (let i = 0; i <= letterIndex; i++) {
      ctx.save();
      const scale = i === letterIndex ? letterScale : 1;
      ctx.translate(offsetX + i * 20, centerY);
      ctx.scale(scale, scale);

      if (i >= 14) {
        ctx.fillStyle = "#00ffff";
        ctx.font = "bold 60px Arial";
      } else {
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 50px Arial";
      }
      ctx.fillText(letters[i], 0, 0);
      ctx.restore();
    }
  }

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed < delayBefore) {
      requestAnimationFrame(animate);
      return;
    }

    draw();

    if (letterIndex < letters.length) {
      letterScale += 0.15;
      if (letterScale >= 1) {
        letterScale = 0;
        letterIndex++;
      }
      requestAnimationFrame(animate);
    }
  }

  animate();
}
