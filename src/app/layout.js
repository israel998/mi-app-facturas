import "./globals.css";

export const metadata = {
  title: "Control de Facturas y Gastos",
  description: "Sistema inteligente de registro de facturas y Estado de Resultados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
