import { highlightDuplicates } from '../modules/preprocessing.js';

const openFileBtn = document.getElementById('openFileBtn');
const fileInput = document.getElementById('fileInput');
const dataTable = document.getElementById('dataTable');
const fileTypeSelect = document.getElementById('fileFormat');

// Khi click nút Open File
openFileBtn.addEventListener('click', () => {
  const type = fileTypeSelect.value;
  fileInput.accept = type === 'csv'
    ? '.csv,text/csv'
    : '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  fileInput.value = ''; // reset nếu chọn lại file cũ
  fileInput.click();
});

// Khi chọn file
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const type = fileTypeSelect.value;
  const fileName = file.name.toLowerCase();

  if ((type === 'csv' && !fileName.endsWith('.csv')) ||
      (type === 'xlsx' && !fileName.endsWith('.xlsx'))) {
    alert(`Wrong file type! Please select a ${type.toUpperCase()} file.`);
    return;
  }

  if (type === 'csv') {
    const reader = new FileReader();
    reader.onload = (e) => displayCSV(e.target.result);
    reader.readAsText(file);
  }

  if (type === 'xlsx') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      displayJSON(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }
});

// CSV -> table
function displayCSV(csvText) {
  const rows = csvText.split('\n').map(r => r.split(','));
  renderTableFromRows(rows);
}

// JSON array -> table
function displayJSON(data) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = [headers, ...data.map(row => headers.map(h => row[h]))];
  renderTableFromRows(rows);
}

// Render table
function renderTableFromRows(rows) {
  dataTable.innerHTML = '';
  if (rows.length === 0) return;

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  rows[0].forEach((h, idx) => {
    const th = document.createElement('th');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = idx;
    checkbox.classList.add('col-selector');
    th.appendChild(checkbox);
    const span = document.createElement('span');
    span.textContent = ` ${h}`;
    th.appendChild(span);
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);
  dataTable.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.slice(1).forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  dataTable.appendChild(tbody);

  attachDuplicateButton();
}

// Nút Show Duplicate
function attachDuplicateButton() {
  let btn = document.getElementById('showDupBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'showDupBtn';
    btn.textContent = 'Show Duplicate';
    dataTable.parentNode.insertBefore(btn, dataTable);

    btn.addEventListener('click', () => {
      const checkedCols = Array.from(document.querySelectorAll('.col-selector:checked'))
                               .map(cb => parseInt(cb.value));
      if (checkedCols.length === 0) {
        alert('Please select at least one column to check duplicates!');
        return;
      }
      highlightDuplicates(dataTable, checkedCols);
    });
  }
}
