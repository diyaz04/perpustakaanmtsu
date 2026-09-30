import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loan, Visit, Book, Member, LibrarySettings } from '../types';

export function exportLoansToExcel(loans: Loan[], settings: LibrarySettings, fileName = 'Laporan_Peminjaman.xlsx') {
  const dataForExcel = loans.map((l, index) => ({
    'No': index + 1,
    'ID Pinjam': l.id,
    'Judul Buku': l.book_title || '-',
    'ISBN': l.book_isbn || '-',
    'Nama Peminjam': l.member_name || '-',
    'NIS/NIP': l.member_number || '-',
    'Kelas/Jabatan': l.member_class || '-',
    'Tgl Pinjam': l.loan_date,
    'Jatuh Tempo': l.due_date,
    'Tgl Kembali': l.return_date || '-',
    'Status': l.status,
    'Denda (Rp)': l.fine_amount || 0,
    'Keterangan': l.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Peminjaman');
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 15 }, // ID Pinjam
    { wch: 35 }, // Judul Buku
    { wch: 18 }, // ISBN
    { wch: 25 }, // Nama Peminjam
    { wch: 18 }, // NIS/NIP
    { wch: 15 }, // Kelas
    { wch: 12 }, // Tgl Pinjam
    { wch: 12 }, // Jatuh Tempo
    { wch: 12 }, // Tgl Kembali
    { wch: 12 }, // Status
    { wch: 12 }, // Denda
    { wch: 20 }, // Keterangan
  ];

  XLSX.writeFile(workbook, fileName);
}

export function exportLoansToPDF(
  loans: Loan[],
  settings: LibrarySettings,
  title = 'LAPORAN PEMINJAMAN DAN PENGEMBALIAN BUKU',
  subtitle = ''
) {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4

  // Letterhead Header (Kop Surat)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(22, 101, 52); // Emerald green
  doc.text(settings.school_name.toUpperCase(), 148, 14, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.library_name.toUpperCase(), 148, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.address, 148, 25, { align: 'center' });

  // Divider Line
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.8);
  doc.line(15, 28, 282, 28);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 148, 36, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 148, 41, { align: 'center' });
  }

  // Table Data
  const tableData = loans.map((l, idx) => [
    idx + 1,
    l.id,
    l.book_title || '-',
    l.member_name || '-',
    l.member_number || '-',
    l.member_class || '-',
    l.loan_date,
    l.due_date,
    l.return_date || '-',
    l.status,
    l.fine_amount ? `Rp ${l.fine_amount.toLocaleString('id-ID')}` : 'Rp 0',
  ]);

  autoTable(doc, {
    startY: subtitle ? 46 : 42,
    head: [['No', 'ID Pinjam', 'Judul Buku', 'Peminjam', 'NIS/NIP', 'Kelas/Jabatan', 'Pinjam', 'Jatuh Tempo', 'Kembali', 'Status', 'Denda']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 163, 74], // emerald green header
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 65 },
      3: { cellWidth: 40 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { halign: 'center', cellWidth: 20 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 20 },
      9: { halign: 'center', cellWidth: 20 },
      10: { halign: 'right', cellWidth: 20 },
    },
  });

  // Calculate Totals
  const totalFine = loans.reduce((acc, curr) => acc + (curr.fine_amount || 0), 0);
  const totalActive = loans.filter((l) => l.status === 'Dipinjam').length;
  const totalLate = loans.filter((l) => l.status === 'Terlambat').length;
  const totalReturned = loans.filter((l) => l.status === 'Dikembalikan').length;

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary box
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ringkasan: Total Transaksi: ${loans.length} | Dipinjam: ${totalActive} | Terlambat: ${totalLate} | Dikembalikan: ${totalReturned} | Total Denda: Rp ${totalFine.toLocaleString('id-ID')}`, 15, finalY);

  // Signature Block
  const sigY = finalY + 12;
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tasikmalaya, ${todayStr}`, 230, sigY, { align: 'center' });
  doc.text('Kepala Perpustakaan,', 230, sigY + 5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(settings.head_librarian, 230, sigY + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.nip_head}`, 230, sigY + 30, { align: 'center' });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${todayStr}.pdf`);
}

export function exportVisitsToExcel(visits: Visit[], settings: LibrarySettings, fileName = 'Laporan_Kunjungan.xlsx') {
  const data = visits.map((v, i) => ({
    'No': i + 1,
    'ID Kunjungan': v.id,
    'Tanggal': v.visit_date,
    'Waktu': v.visit_time,
    'Nama Pengunjung': v.visitor_name,
    'NIS / NIP': v.visitor_number || '-',
    'Kategori': v.role.toUpperCase(),
    'Kelas / Jabatan': v.class_or_position || '-',
    'Tujuan Kunjungan': v.purpose,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi Kunjungan');
  XLSX.writeFile(workbook, fileName);
}


// ============================================================
// EXPORT KOLEKSI BUKU (tanpa foto sampul)
// ============================================================

export function exportBooksToExcel(books: Book[], settings: LibrarySettings, fileName = 'Data_Koleksi_Buku.xlsx') {
  const data = books.map((b, i) => ({
    'No': i + 1,
    'Judul Buku': b.title,
    'Pengarang': b.author || '-',
    'Penerbit': b.publisher || '-',
    'Tahun': b.year || '-',
    'ISBN': b.isbn || '-',
    'Barcode': b.barcode || '-',
    'Kategori': b.category,
    'Lokasi Rak': b.shelf_location || '-',
    'Total Stok': b.stock,
    'Tersedia': b.available_stock,
    'Sedang Dipinjam': Math.max(0, b.stock - b.available_stock),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 40 }, // Judul
    { wch: 25 }, // Pengarang
    { wch: 25 }, // Penerbit
    { wch: 8 },  // Tahun
    { wch: 20 }, // ISBN
    { wch: 18 }, // Barcode
    { wch: 20 }, // Kategori
    { wch: 22 }, // Rak
    { wch: 11 }, // Total Stok
    { wch: 10 }, // Tersedia
    { wch: 16 }, // Dipinjam
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Koleksi Buku');
  XLSX.writeFile(workbook, fileName);
}

export function exportBooksToPDF(
  books: Book[],
  settings: LibrarySettings,
  title = 'DATA KOLEKSI BUKU PERPUSTAKAAN',
  subtitle = ''
) {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4

  // Kop surat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(22, 101, 52);
  doc.text(settings.school_name.toUpperCase(), 148, 14, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(settings.library_name.toUpperCase(), 148, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.address, 148, 25, { align: 'center' });

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.8);
  doc.line(15, 28, 282, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 148, 36, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 148, 41, { align: 'center' });
  }

  const tableData = books.map((b, idx) => [
    idx + 1,
    b.title,
    b.author || '-',
    b.publisher || '-',
    b.year || '-',
    b.isbn || '-',
    b.category,
    b.shelf_location || '-',
    b.stock,
    b.available_stock,
  ]);

  autoTable(doc, {
    startY: subtitle ? 46 : 42,
    head: [['No', 'Judul Buku', 'Pengarang', 'Penerbit', 'Tahun', 'ISBN', 'Kategori', 'Rak', 'Stok', 'Tersedia']],
    body: tableData,
    theme: 'grid',
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 58 },
      2: { cellWidth: 36 },
      3: { cellWidth: 34 },
      4: { halign: 'center', cellWidth: 14 },
      5: { cellWidth: 30 },
      6: { cellWidth: 28 },
      7: { cellWidth: 25 },
      8: { halign: 'center', cellWidth: 14 },
      9: { halign: 'center', cellWidth: 18 },
    },
    // Ulangi header di tiap halaman + nomor halaman
    didDrawPage: () => {
      const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Halaman ${pageNum}`, 282, 203, { align: 'right' });
    },
  });

  const totalJudul = books.length;
  const totalEksemplar = books.reduce((s, b) => s + b.stock, 0);
  const totalTersedia = books.reduce((s, b) => s + b.available_stock, 0);

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Ringkasan: Total Judul: ${totalJudul} | Total Eksemplar: ${totalEksemplar} | Tersedia: ${totalTersedia} | Dipinjam: ${Math.max(0, totalEksemplar - totalTersedia)}`,
    15,
    finalY
  );

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Blok tanda tangan (pindah halaman kalau sisa ruang tidak cukup)
  let sigY = finalY + 12;
  if (sigY + 35 > 200) {
    doc.addPage();
    sigY = 20;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tasikmalaya, ${todayStr}`, 230, sigY, { align: 'center' });
  doc.text('Kepala Perpustakaan,', 230, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(settings.head_librarian, 230, sigY + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${settings.nip_head}`, 230, sigY + 30, { align: 'center' });

  doc.save(`data_koleksi_buku_${todayStr.replace(/\s+/g, '_')}.pdf`);
}
