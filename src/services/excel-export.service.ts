import ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import logger from "../utils/logger";
import Customer from "../schemas/customer.schema";
import Contract from "../schemas/contract.schema";
import Payment, { PaymentType } from "../schemas/payment.schema";
import Employee from "../schemas/employee.schema";
import dayjs from "dayjs";

class ExcelExportService {
  private exportDir = path.join(process.cwd(), "exports");

  constructor() {
    // Export papkasini yaratish
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Database'dan Excel export qilish
   * Faqat customers, contracts va payments
   */
  async exportDatabase(): Promise<{ success: boolean; filePath?: string; message: string }> {
    try {
      logger.info("📊 Starting Excel export...");

      // 1. Barcha active contract'larni olish
      const contracts = await Contract.find({
        isDeleted: false,
      })
        .populate("customer")
        .populate("payments")
        .lean();

      if (contracts.length === 0) {
        return {
          success: false,
          message: "Export qilish uchun shartnomalar topilmadi",
        };
      }

      logger.info(`✅ Found ${contracts.length} contract(s) to export`);

      // 2. Excel data tayyorlash
      const excelData: any[] = [];

      // ✅ Header qatori 1: Inglizcha field names (import uchun)
      const headerRow1 = [
        "startDate",               // row[0] - Shartnoma sanasi
        "initialPaymentDueDate",   // row[1] - To'lov kuni (1-31)
        "nextPaymentDate",         // row[2] - Keyingi to'lov sanasi
        "customer",                // row[3] - Mijoz
        "productName",             // row[4] - Mahsulot
        "ID",                      // row[5] - Shartnoma ID (customId)
        "originalPrice",           // row[6] - Asl narx
        "price",                   // row[7] - Narx
        "initialPayment",          // row[8] - Boshlang'ich to'lov
        "period",                  // row[9] - Muddat (oy)
        "monthlyPayment",          // row[10] - Oylik to'lov
        "totalPrice",              // row[11] - Umumiy narx
        "percentage",              // row[12] - Foiz
        "notes",                   // row[13] - Izoh
        "box",                     // row[14] - Karobka
        "mbox",                    // row[15] - Muslim Karobka
      ];

      // ✅ Header qatori 2: O'zbekcha labels
      const headerRow2 = [
        "Chiqqan sana",            // Shartnoma sanasi (startDate)
        "To'lov kuni",             // To'lov kuni (1-31)
        "To'lov sanasi",           // Keyingi to'lov sanasi (nextPaymentDate)
        "Kimga",                   // Mijoz
        "Texnika",                 // Mahsulot
        "Shartnoma ID raqami",     // Shartnoma ID
        "Tani",                    // Asl narx
        "Etilgan",                 // Narx
        "1-vznos",                 // Boshlang'ich to'lov
        "Oy",                      // Muddat
        "Oyiga",                   // Oylik to'lov
        "Umumiy summa",            // Umumiy narx
        "foiz",                    // Foiz
        "izoh",                    // Izoh
        "Karobka",                 // Box
        "Muslim Karobka",          // Mbox
      ];

      // Oylik to'lovlar ustunlarini qo'shish
      // Eng eski va eng yangi to'lov sanalarini topish
      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      for (const contract of contracts) {
        const payments = (contract.payments as any[]).filter(
          (p) => p.paymentType === PaymentType.MONTHLY && p.isPaid
        );

        for (const payment of payments) {
          const date = new Date(payment.date);
          if (!minDate || date < minDate) minDate = date;
          if (!maxDate || date > maxDate) maxDate = date;
        }
      }

      // Oylik ustunlarni yaratish (MM/YYYY formatda)
      const monthColumns: string[] = [];
      if (minDate && maxDate) {
        let current = dayjs(minDate).startOf("month");
        const end = dayjs(maxDate).startOf("month");

        while (current.isBefore(end) || current.isSame(end)) {
          monthColumns.push(current.format("MM/YYYY"));
          current = current.add(1, "month");
        }
      }

      // Oylik ustunlarni faqat birinchi header'ga qo'shish
      headerRow1.push(...monthColumns);

      // Ikkinchi header uchun bo'sh qiymatlar (oylik ustunlar uchun)
      const emptyMonthHeaders = monthColumns.map(() => "");
      headerRow2.push(...emptyMonthHeaders);

      // Ikki qatorli header
      excelData.push(headerRow1);
      excelData.push(headerRow2);

      // 3. Har bir contract uchun qator yaratish
      for (const contract of contracts) {
        const customer = contract.customer as any;
        const contractAny = contract as any;

        // ✅ Asosiy shartnoma ma'lumotlari (import format)
        // totalPrice = initialPayment + (monthlyPayment * period)
        const monthlyPayment = Math.round(contract.monthlyPayment || 0);
        const totalPrice = Math.round((contract.initialPayment || 0) + (monthlyPayment * (contract.period || 12)));

        // ✅ originalPaymentDay - to'lov kuni (1-31)
        const paymentDay = contract.originalPaymentDay || dayjs(contract.startDate).date();

        // ✅ nextPaymentDate - database'dan olish (to'g'ri sana)
        const nextPaymentDate = dayjs(contract.nextPaymentDate).format("DD/MM/YYYY");

        const row: any[] = [
          dayjs(contract.startDate).format("DD/MM/YYYY"),              // row[0] - Shartnoma sanasi (15/06/2025)
          paymentDay,                                                 // row[1] - To'lov kuni (18)
          nextPaymentDate,                                            // row[2] - Keyingi to'lov sanasi (18/07/2025)
          customer?.fullName || "Unknown",                           // row[3] - Mijoz
          contract.productName || "",                                // row[4] - Mahsulot
          contract.customId || "",                                   // row[5] - Shartnoma ID (customId)
          Math.round(contract.originalPrice || 0),                   // row[6] - Asl narx
          Math.round(contract.price || 0),                            // row[7] - Narx
          Math.round(contract.initialPayment || 0),                   // row[8] - Boshlang'ich to'lov
          contract.period || 12,                                     // row[9] - Muddat (oy)
          monthlyPayment,                                            // row[10] - Oylik to'lov
          totalPrice,                                                // row[11] - Umumiy narx
          contract.percentage || 30,                                 // row[12] - Foiz
          "",                                                        // row[13] - Izoh
          contractAny.box ? "bor" : "",                              // row[14] - Box
          contractAny.mbox ? "bor" : "",                             // row[15] - Mbox
        ];

        // Oylik to'lovlarni qo'shish
        const payments = (contract.payments as any[]).filter(
          (p) => p.paymentType === PaymentType.MONTHLY && p.isPaid
        );

        // Har bir oy ustuni uchun to'lov summasi topish
        for (const monthCol of monthColumns) {
          const payment = payments.find((p) => {
            const paymentMonth = dayjs(p.date).format("MM/YYYY");
            return paymentMonth === monthCol;
          });

          row.push(payment ? Math.round(payment.actualAmount || payment.amount || 0) : "");
        }

        excelData.push(row);
      }

      // 4. Excel fayl yaratish (ExcelJS)
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Shartnomalar");

      // ✅ Ma'lumotlarni worksheet'ga qo'shish
      excelData.forEach(row => {
        worksheet.addRow(row);
      });

      // ✅ Ustun kengliklarini sozlash
      worksheet.columns = [
        { width: 12 },  // startDate
        { width: 8 },   // initialPaymentDueDate (kun)
        { width: 12 },  // nextPaymentDate
        { width: 25 },  // customer
        { width: 35 },  // productName
        { width: 12 },  // ID (customId)
        { width: 12 },  // originalPrice
        { width: 10 },  // price
        { width: 12 },  // initialPayment
        { width: 8 },   // period
        { width: 12 },  // monthlyPayment
        { width: 12 },  // totalPrice
        { width: 8 },   // percentage
        { width: 15 },  // notes (kichikroq)
        { width: 10 },  // box
        { width: 15 },  // mbox
        ...monthColumns.map(() => ({ width: 10 })), // Oylik ustunlar
      ];

      // ✅ Ranglar qo'shish (ExcelJS format)
      // Header row 1 - Ko'k rang
      const headerRow1Cells = worksheet.getRow(1);
      headerRow1Cells.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' } // Ko'k
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Oq text
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Header row 2 - Och ko'k rang
      const headerRow2Cells = worksheet.getRow(2);
      headerRow2Cells.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFB4C7E7' } // Och ko'k
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Mijoz ustuni (D) - sariq rang
      for (let i = 3; i <= worksheet.rowCount; i++) {
        const cell = worksheet.getCell(i, 4); // D ustuni (customer)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' } // Och sariq
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      // totalPrice ustuni (L) - yashil rang (indeksi o'zgargan: 11 → 12)
      for (let i = 3; i <= worksheet.rowCount; i++) {
        const cell = worksheet.getCell(i, 12); // L ustuni (totalPrice)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' } // Och yashil
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }

      // 5. Fayl nomini yaratish
      const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const fileName = `database-backup-${timestamp}.xlsx`;
      const filePath = path.join(this.exportDir, fileName);

      // 6. Faylni saqlash (ExcelJS)
      await workbook.xlsx.writeFile(filePath);

      logger.info(`✅ Excel export completed: ${fileName}`);

      return {
        success: true,
        filePath,
        message: `${contracts.length} ta shartnoma export qilindi`,
      };
    } catch (error: any) {
      logger.error("❌ Excel export failed:", error.message);
      return {
        success: false,
        message: `Export failed: ${error.message}`,
      };
    }
  }

  /**
   * Eski export'larni o'chirish (faqat oxirgi 5 tasini saqlash)
   */
  async cleanOldExports(): Promise<void> {
    try {
      const files = fs.readdirSync(this.exportDir)
        .filter(file => file.endsWith(".xlsx"))
        .map(file => ({
          name: file,
          path: path.join(this.exportDir, file),
          time: fs.statSync(path.join(this.exportDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Yangilardan eskiga

      // Faqat oxirgi 5 tasini saqlash
      const filesToDelete = files.slice(5);

      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        logger.debug(`🗑️ Deleted old export: ${file.name}`);
      }

      if (filesToDelete.length > 0) {
        logger.info(`🧹 Cleaned ${filesToDelete.length} old export(s)`);
      }
    } catch (error: any) {
      logger.error("❌ Failed to clean old exports:", error.message);
    }
  }
}

export default new ExcelExportService();
