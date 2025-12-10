import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SummonerProvider } from './context/SummonerContext'
import { CombatProvider } from './context/CombatContext'
import { RollHistoryProvider } from './context/RollHistoryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SummonerProvider>
      <CombatProvider>
        <RollHistoryProvider>
          <App />
        </RollHistoryProvider>
      </CombatProvider>
    </SummonerProvider>
  </StrictMode>,
)
