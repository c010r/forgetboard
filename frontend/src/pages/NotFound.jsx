import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const frases = [
  'Esta página se fue de vacaciones sin avisar.',
  'Ni Cortázar encuentra esta página.',
  'La página existe pero tu WiFi no quiere saber nada.',
  'Error 404: la página está en una meeting y no contesta.',
  'Se rompió todo. Bueno, no todo, pero esta página sí.',
  'La página bailó tango y se fue para no volver.',
  'Esto está más perdido que turista en obra.',
  'Ni el loro de la vecina sabe dónde está esta página.',
  'Error 404: la página le ganó el partido y se fue a festejar.',
  'No está. Preguntale a ChatGPT a ver si la encuentra.',
  'La página miró el código, dijo "ni en pedo" y huyó.',
  'Esta URL está más vacía que la heladera después del finde.',
  'Alguien tocó algo que no debía. No vamos a decir quién fue pero somos todos.',
  '404: la página se borró sola, juro que no fui yo.',
  'Acá no hay nada, salvo este mensaje y un par de hormigas.',
]

export default function NotFound() {
  const navigate = useNavigate()
  const [frase] = useState(() => frases[Math.floor(Math.random() * frases.length)])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-bold text-slate-300 mb-2">404</h1>
      <p className="text-slate-400 text-lg mb-8 italic">"{frase}"</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al inicio (antes que se pierda este botón también)
      </button>
    </div>
  )
}
