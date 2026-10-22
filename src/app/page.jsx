"use client";
import { useState, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Camera, FileText } from "lucide-react";

export default function Home() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const fileInputRef = useRef(null);

  // Reemplaza esto con la URL de tu Web App de Google Apps Script
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxhvqaHlrlEFeQFw7pA0yAQHs-uYsIxmyxi7i9sUgFvqBjywnXH7iFG6yooikYRGygJ/exec";

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMensaje("Procesando factura con IA y guardando en Google Drive...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      try {
        const response = await fetch(GAS_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            image: base64Image,
            mimeType: file.type
          })
        });

        const result = await response.json();

        if (result.status === "success") {
          setFacturas((prev) => [result.data, ...prev]);
          setMensaje("¡Factura procesada y guardada exitosamente en tus 5TB de Drive!");
        } else {
          setMensaje("Error al procesar: " + result.message);
        }
      } catch (err) {
        setMensaje("Error de conexión con el servidor de Google: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalIngresos = facturas
    .filter((f) => f.tipo === "INGRESO")
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const totalEgresos = facturas
    .filter((f) => f.tipo === "EGRESO")
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0);

  const resultadoNeto = totalIngresos - totalEgresos;

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Estado de Resultados y Reporte de Facturas", 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Ingresos: $${totalIngresos.toFixed(2)}`, 14, 30);
    doc.text(`Total Egresos: $${totalEgresos.toFixed(2)}`, 14, 38);
    doc.text(`Resultado Neto: $${resultadoNeto.toFixed(2)}`, 14, 46);

    const tableData = facturas.map((f) => [
      f.fecha || "",
      f.proveedor || "",
      f.numero_factura || "",
      f.tipo || "",
      `$${Number(f.total || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 55,
      head: [["Fecha", "Proveedor", "Nº Factura", "Tipo", "Total"]],
      body: tableData,
    });

    doc.save("estado_de_resultados.pdf");
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-blue-400" /> Control de Facturas y Gastos
          </h1>
          <button
            onClick={generarPDF}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
          >
            <FileText size={18} /> Descargar Reporte PDF
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-400">${totalIngresos.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400">Egresos / Gastos</p>
            <p className="text-2xl font-bold text-red-400">${totalEgresos.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400">Resultado Neto</p>
            <p className={`text-2xl font-bold ${resultadoNeto >= 0 ? "text-blue-400" : "text-yellow-400"}`}>
              ${resultadoNeto.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center space-y-4">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold text-lg transition disabled:opacity-50"
            >
              <Camera size={22} /> Tomar Foto / Subir Factura
            </button>
          </div>
          {loading && <p className="text-yellow-400 animate-pulse">Analizando imagen y guardando...</p>}
          {mensaje && <p className="text-sm text-gray-300">{mensaje}</p>}
        </section>

        <section className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 font-semibold">Facturas Registradas</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-sm">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Nº Factura</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm">
                {facturas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No hay facturas registradas todavía. Toma una foto para comenzar.
                    </td>
                  </tr>
                ) : (
                  facturas.map((f, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="p-3">{f.fecha}</td>
                      <td className="p-3 font-medium">{f.proveedor}</td>
                      <td className="p-3 text-gray-400">{f.numero_factura}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${f.tipo === "INGRESO" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                          {f.tipo}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{f.categoria}</td>
                      <td className="p-3 text-right font-bold">${Number(f.total || 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
