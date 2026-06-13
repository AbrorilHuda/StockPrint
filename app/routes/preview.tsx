import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/preview";
import type { StockFormData } from "../types/stock";
import { getSavedStockData } from "../utils/storage";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Dicetak menggunakan StokPrint" },
    { name: "description", content: "Pratinjau lembar stok siap cetak." },
  ];
}

export default function Preview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StockFormData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHelperLines, setShowHelperLines] = useState(true);

  useEffect(() => {
    const saved = getSavedStockData();
    if (!saved.items || saved.items.length === 0) {
      // If no items are configured, redirect back to home
      navigate("/");
      return;
    }
    setFormData(saved);
    setIsLoaded(true);
  }, [navigate]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "__________________";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        // Simple Indonesian date formatting: DD/MM/YYYY
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) { }
    return dateStr;
  };

  if (!isLoaded || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="preview-page-container min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="no-print sticky top-0 z-50 w-full glass-panel border-b border-slate-800 bg-slate-950/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-2xl transition-all active:scale-[0.98] outline-none cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Edit Daftar Barang
          </button>
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-200">Pratinjau Cetak</h2>
            <p className="text-[11px] text-slate-500">Ukuran A4 Portrait</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Helper Lines Toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHelperLines}
              onChange={(e) => setShowHelperLines(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950/50 text-indigo-600 focus:ring-indigo-500/20"
            />
            Tampilkan Garis Pembatas Kertas (A4)
          </label>

          {/* Print Action Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-950/40 active:scale-[0.98] outline-none cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Form (Print)
          </button>
        </div>
      </div>

      {/* Simulated physical workbench workspace */}
      <div className="print-workbench flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-900/60 relative">

        {/* A4 simulated page */}
        <div className={`a4-page ${showHelperLines ? "outline-dashed outline-indigo-500/30 outline-offset-8" : ""}`}>

          {/* A4 Header Block */}
          <header className="mb-6 border-b-2 border-black pb-4">
            <h1 className="text-center text-xl font-extrabold tracking-wide uppercase text-black">
              {formData.title}
            </h1>

            {/* Meta Row */}
            <div className="mt-5 grid grid-cols-2 text-xs font-semibold text-stone-800">
              <div className="flex items-center gap-1">
                <span className="text-stone-500">Etalase/Lokasi:</span>
                <span className="text-black border-b border-stone-400 min-w-[120px] pb-0.5">
                  {formData.cabinetName || "_________________"}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-stone-500">Tanggal:</span>
                <span className="text-black border-b border-stone-400 min-w-[100px] pb-0.5 text-right">
                  {formatDateString(formData.date)}
                </span>
              </div>
            </div>
          </header>

          {/* Stock Table */}
          <table className="w-full border-collapse border border-black text-xs text-black">
            <thead>
              <tr className="bg-stone-100">
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "8%" }}>
                  SATUAN
                </th>
                <th className="border border-black py-2 px-2 text-left font-bold" style={{ width: "30%" }}>
                  NAMA BARANG
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "8%" }}>
                  JML
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "13%" }}>
                  HARGA
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "8%" }}>
                  KRG
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "13%" }}>
                  HARGA
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "8%" }}>
                  LBH
                </th>
                <th className="border border-black py-2 px-1 text-center font-bold" style={{ width: "12%" }}>
                  HARGA
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={`${item}-${index}`} className="hover:bg-indigo-50/20 transition-colors">
                  {/* Satuan (Empty for manual fill) */}
                  <td className="border border-black py-3 px-1 text-center font-medium"></td>

                  {/* Nama Barang */}
                  <td className="border border-black py-3 px-2 text-left font-semibold text-stone-900 bg-stone-50/10">
                    {item}
                  </td>

                  {/* Jml (Empty) */}
                  <td className="border border-black py-3 px-1"></td>

                  {/* Harga (Empty) */}
                  <td className="border border-black py-3 px-1"></td>

                  {/* Krg (Empty) */}
                  <td className="border border-black py-3 px-1"></td>

                  {/* Harga (Empty) */}
                  <td className="border border-black py-3 px-1"></td>

                  {/* Lbh (Empty) */}
                  <td className="border border-black py-3 px-1"></td>

                  {/* Harga (Empty) */}
                  <td className="border border-black py-3 px-1"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer of sheet */}
          <footer className="mt-8 flex justify-between text-[10px] text-stone-400 font-mono italic">
            <span>* Di-generate otomatis oleh StokPrint</span>
            <span>Tanda Tangan Pemeriksa: ________________</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
