import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PokePortal from './PokePortal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PokePortal />
  </StrictMode>,
)