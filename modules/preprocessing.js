export function enableDuplicateCheck(tableElement, onDuplicateChange) {
  const thead = tableElement.querySelector('thead');
  if (!thead) return;

  const headerRow = thead.querySelector('tr');
  if (!headerRow) return;

  // Thêm checkbox vào từng header
  Array.from(headerRow.children).forEach((th, idx) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginLeft = '6px';
    checkbox.title = 'Use this column to check duplicates';

    th.appendChild(checkbox);
  });

  // Thêm nút "Show Duplicate"
  const toolbar = document.createElement('div');
  toolbar.style.margin = '10px 0';

  const btnShowDuplicate = document.createElement('button');
  btnShowDuplicate.textContent = 'Show Duplicate';
  btnShowDuplicate.style.marginRight = '10px';

  toolbar.appendChild(btnShowDuplicate);

  tableElement.parentElement.insertBefore(toolbar, tableElement);

  let highlightOn = false;

  btnShowDuplicate.addEventListener('click', () => {
    highlightOn = !highlightOn;
    btnShowDuplicate.textContent = highlightOn ? 'Hide Duplicate' : 'Show Duplicate';

    if (highlightOn) {
      const selectedCols = Array.from(headerRow.children)
        .map((th, i) => ({ th, i }))
        .filter(({ th }) => th.querySelector('input[type=checkbox]').checked)
        .map(({ i }) => i);

      highlightDuplicates(tableElement, selectedCols);
      onDuplicateChange && onDuplicateChange(true);
    } else {
      clearHighlight(tableElement);
      onDuplicateChange && onDuplicateChange(false);
    }
  });
}

function highlightDuplicates(tableElement, selectedColumns) {
  if (selectedColumns.length === 0) return;

  const tbody = tableElement.querySelector('tbody');
  if (!tbody) return;

  // Lấy dữ liệu từ các cột đã chọn để tạo key kiểm tra trùng
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const map = new Map();

  rows.forEach(row => {
    const key = selectedColumns.map(i => row.children[i]?.textContent.trim() ?? '').join('||');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });

  // Highlight các dòng có duplicate (xuất hiện >= 2 lần)
  rows.forEach(row => row.style.backgroundColor = '');
  for (const [key, rowGroup] of map.entries()) {
    if (rowGroup.length > 1) {
      rowGroup.forEach(r => r.style.backgroundColor = 'yellow');
    }
  }
}

function clearHighlight(tableElement) {
  const tbody = tableElement.querySelector('tbody');
  if (!tbody) return;

  tbody.querySelectorAll('tr').forEach(row => {
    row.style.backgroundColor = '';
  });
}
