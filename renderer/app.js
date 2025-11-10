// === Screens (HTML Templates) ===
const screens = {
  start: `
    <div id="startScreen" class="screen active fade-in">
      <div class="start-text">Press any button to start...</div>
    </div>
  `,

  loading: `
    <div id="loadingScreen" class="screen active fade-in">
      <div id="progressContainer">
        <div id="progressBar"></div>
        <span id="loadingText">LOADING</span>
      </div>
    </div>
  `,

  select: `
    <div id="selectScreen" class="screen active fade-in">
      <h2>Chọn hoặc tạo dự án</h2>
      <button id="btnStartProcess">Bắt đầu xử lý</button>
    </div>
  `
};

// === Hiển thị một màn hình với hiệu ứng fade ===
function showScreen(name) {
  const app = document.getElementById('app');
  const oldScreen = app.querySelector('.screen');

  if (oldScreen) {
    oldScreen.classList.add('fade-out');
    setTimeout(() => {
      app.innerHTML = screens[name];
      const newScreen = app.querySelector('.screen');
      newScreen.classList.add('fade-in');
    }, 400); // thời gian trùng với CSS fade-out
  } else {
    app.innerHTML = screens[name];
  }
}

// === InitAPP ===
function initApp() {
  showScreen('start');

  const app = document.getElementById('app');

  function startHandler() {
    document.removeEventListener('keydown', startHandler);
    app.removeEventListener('click', startHandler);

    // Sang màn loading
    showScreen('loading');
    setTimeout(startLoading, 500);
  }

  document.addEventListener('keydown', startHandler);
  app.addEventListener('click', startHandler);
}

// === Loading progress 3s ===
function startLoading() {
  const bar = document.getElementById('progressBar');
  let width = 0;
  const duration = 3000;
  const intervalTime = 30;
  const step = 100 / (duration / intervalTime);

  const interval = setInterval(() => {
    width += step;
    if (width >= 100) {
      width = 100;
      clearInterval(interval);
      setTimeout(showSelectScreen, 300);
    }
    bar.style.width = width + '%';
  }, intervalTime);
}

// === Màn hình chọn dự án ===
function showSelectScreen() {
  showScreen('select');
  document.getElementById('btnStartProcess').addEventListener('click', () => {
    alert('Bắt đầu xử lý dự án... (sẽ gọi API backend)');
  });
}

// === Chạy ứng dụng ===
initApp();
