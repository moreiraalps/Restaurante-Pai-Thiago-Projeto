import './globals.css'

export const metadata = {
  title: 'Restaurante Pai Thiag - Sistema Completo',
  description: 'Sistema profissional de gestão de restaurante com pedidos, reservas e múltiplos tipos de usuário',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}