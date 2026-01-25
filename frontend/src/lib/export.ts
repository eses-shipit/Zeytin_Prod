import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
  // Format column width
  const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

