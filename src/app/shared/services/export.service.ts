import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  async exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos'): Promise<void> {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    const workbook = new Workbook();
    workbook.creator = 'El Morralito+';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    const columnKeys = Object.keys(data[0]);

    try {
      const logoUrl = `${window.location.origin}/favicon.png`;
      const imageBuffer = await this.loadImageAsBuffer(logoUrl);

      const logoId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      worksheet.addImage(logoId, {
        tl: { col: 0.2, row: 0.2 },
        ext: { width: 80, height: 80 }
      });
    } catch (err) {
      console.warn('no se pudo cargar el logo:', err);
    }

    worksheet.mergeCells(1, 2, 2, columnKeys.length);
    const titleCell = worksheet.getCell(1, 2);
    titleCell.value = `${sheetName.toUpperCase()}`;
    titleCell.font = {
      name: 'Calibri',
      size: 20,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF6A64C' }
    };
    titleCell.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 30;

    worksheet.getCell(1, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF6A64C' }
    };
    worksheet.getCell(2, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF6A64C' }
    };


    worksheet.mergeCells(3, 1, 3, columnKeys.length);
    const dateCell = worksheet.getCell(3, 1);
    const fechaHora = new Date().toLocaleString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    dateCell.value = `El Morralito+ | Generado: ${fechaHora} | Registros: ${data.length}`;
    dateCell.font = {
      name: 'Calibri',
      size: 11,
      italic: true,
      color: { argb: 'FF6B7280' }
    };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF3E0' }
    };
    dateCell.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getRow(3).height = 22;

    const headerRow = worksheet.getRow(4);
    columnKeys.forEach((key, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = key;
      cell.font = {
        name: 'Calibri',
        size: 12,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8903C' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFF6A64C' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'medium', color: { argb: 'FFF6A64C' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
    });
    worksheet.getRow(4).height = 28;

    data.forEach((item, rowIndex) => {
      const rowNumber = rowIndex + 5;
      const row = worksheet.getRow(rowNumber);

      const isEvenRow = rowIndex % 2 === 0;

      columnKeys.forEach((key, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = item[key];

        const bgColor = isEvenRow ? 'FFFEF9F3' : 'FFFFFFFF';

        cell.font = {
          name: 'Calibri',
          size: 11,
          color: { argb: 'FF374151' }
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        if (typeof item[key] === 'number') {
          cell.alignment = { ...cell.alignment, horizontal: 'right' };
          cell.numFmt = '#,##0';
        }
      });

      row.height = 20;
      row.commit();
    });

    columnKeys.forEach((key, index) => {
      let maxLength = key.length;

      data.forEach(row => {
        const cellValue = row[key];
        if (cellValue) {
          const cellLength = cellValue.toString().length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });

      const column = worksheet.getColumn(index + 1);
      column.width = Math.min(Math.max(maxLength + 3, 15), 60);
    });

    const lastRowNumber = data.length + 5;
    const lastRow = worksheet.getRow(lastRowNumber);

    worksheet.mergeCells(lastRowNumber, 1, lastRowNumber, columnKeys.length);
    lastRow.height = 25;
    lastRow.commit();

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fecha = new Date().toISOString().split('T')[0];
    saveAs(blob, `${fileName}_${fecha}.xlsx`);
  }

  private async loadImageAsBuffer(url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => resolve(buffer))
        .catch(err => reject(err));
    });
  }

  async exportToPDF(
    headers: string[],
    body: any[][],
    titulo: string,
    fileName: string,
    orientation: 'portrait' | 'landscape' = 'landscape'
  ): Promise<void> {
    const doc = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primaryColor: [number, number, number] = [246, 166, 76];
    const secondaryColor: [number, number, number] = [255, 243, 224];
    const darkText: [number, number, number] = [31, 41, 55];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

    try {
      const logoUrl = `${window.location.origin}/favicon.png`;
      const img = await this.loadImage(logoUrl);
      doc.addImage(img, 'PNG', 15, 8, 20, 20);
    } catch (err) {
      console.warn('logo no disponible');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(titulo, 45, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('El Morralito+ | Sistema de Gestión Veterinaria', 45, 26);

    doc.setFontSize(9);
    const fechaHora = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${fechaHora}`, pageWidth - 15, 15, { align: 'right' });
    doc.text(`Total de registros: ${body.length}`, pageWidth - 15, 21, { align: 'right' });

    autoTable(doc, {
      startY: 42,
      head: [headers],
      body: body,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText,
        cellPadding: 4,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: secondaryColor
      },
      styles: {
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      didDrawPage: (data) => {
        const pageNumber = doc.getNumberOfPages();
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.text(
          '© 2025 El Morralito+ - Todos los derechos reservados',
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(
          `Página ${pageNumber}`,
          pageWidth - 20,
          pageHeight - 8,
          { align: 'right' }
        );
      },
      margin: { top: 42, left: 15, right: 15, bottom: 20 },
      tableWidth: 'auto'
    });

    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`${fileName}_${fecha}.pdf`);
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }
}
