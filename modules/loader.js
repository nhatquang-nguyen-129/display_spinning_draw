const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

/**
 * Load CSV file
 * @param {string} filePath
 * @returns {Array<Object>}
 */
function loadCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    return records;
  } catch (err) {
    console.error('Error loading CSV:', err);
    return [];
  }
}

/**
 * Load XLSX file
 * @param {string} filePath
 * @returns {Array<Object>}
 */
function loadXLSX(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return data;
  } catch (err) {
    console.error('Error loading XLSX:', err);
    return [];
  }
}

/**
 * Load JSON file
 * @param {string} filePath
 * @returns {Array<Object>}
 */
function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error loading JSON:', err);
    return [];
  }
}

/**
 * Load file theo path & type
 * @param {string} filePath
 * @returns {Array<Object>}
 */
function loadFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return loadCSV(filePath);
  if (ext === '.xlsx') return loadXLSX(filePath);
  if (ext === '.json') return loadJSON(filePath);
  console.error('Unsupported file type:', ext);
  return [];
}

/**
 * Tạo HTML table từ array of objects
 * @param {Array<Object>} data
 * @returns {string}
 */
function generateTableHTML(data) {
  if (!data || data.length === 0) return '<p>No data loaded.</p>';

  const headers = Object.keys(data[0]);
  let html = '<table><thead><tr>';
  headers.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => { html += `<td>${row[h]}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

module.exports = {
  loadCSV,
  loadXLSX,
  loadJSON,
  loadFile,
  generateTableHTML
};
