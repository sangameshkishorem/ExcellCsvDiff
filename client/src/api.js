import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function uploadFiles(sourceFile, targetFile) {
  const formData = new FormData();
  formData.append('source', sourceFile);
  formData.append('target', targetFile);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function runComparison(sourceRows, targetRows, joinKey, columns) {
  const res = await api.post('/compare', { sourceRows, targetRows, joinKey, columns });
  return res.data;
}

export async function exportToExcel(results, summary, columns, joinKey) {
  const res = await api.post(
    '/export',
    { results, summary, columns, joinKey },
    { responseType: 'blob' }
  );
  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `migration-comparison-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
