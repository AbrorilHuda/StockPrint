import type { StockFormData } from "../types/stock";

const STORAGE_KEY = "stock_print_data";

export const DEFAULT_STOCK_DATA: StockFormData = {
  title: "FORM CETAK STOK BARANG",
  date: "", // Will be dynamically set to today's date if empty
  cabinetName: "Etalase Utama",
  items: [
    "Surya 16",
    "Marlboro Red",
    "Esse Change 20",
    "Djarum Super 12",
    "Sari Roti Tawar",
    "Indomie Goreng Spesial",
    "Mie Sedaap Soto",
    "Coca Cola 390ml",
    "Aqua Gelas Dus",
    "Kopi Kapal Api 165g",
    "Pepsodent Herbal 190g",
    "Lifebuoy Merah 110g",
    "Sunlight Jeruk Nipis 750ml",
    "Minyak Goreng Bimoli 2L",
    "Gula Pasir Gulaku 1kg",
  ],
};

export function getSavedStockData(): StockFormData {
  if (typeof window === "undefined") {
    return DEFAULT_STOCK_DATA;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        title: parsed.title || DEFAULT_STOCK_DATA.title,
        date: parsed.date || "",
        cabinetName: parsed.cabinetName || "",
        items: Array.isArray(parsed.items) ? parsed.items : DEFAULT_STOCK_DATA.items,
      };
    }
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
  }

  return DEFAULT_STOCK_DATA;
}

export function saveStockData(data: StockFormData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
}
