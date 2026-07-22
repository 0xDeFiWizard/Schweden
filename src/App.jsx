import { Routes, Route } from 'react-router-dom'
import { useTrip } from './data/TripContext'
import Nav from './components/Nav'
import Onboarding from './screens/Onboarding'
import Dashboard from './screens/Dashboard'
import Catches from './screens/Catches'
import Team from './screens/Team'
import Packing from './screens/Packing'
import Shopping from './screens/Shopping'
import Budget from './screens/Budget'
import Tasks from './screens/Tasks'
import Fishing from './screens/Fishing'
import MapScreen from './screens/MapScreen'
import Boat from './screens/Boat'
import Planner from './screens/Planner'
import Chat from './screens/Chat'
import Emergency from './screens/Emergency'
import Lexicon from './screens/Lexicon'
import More from './screens/More'
import Weather from './screens/Weather'
import BiteIndex from './screens/BiteIndex'
import DepthMap from './screens/DepthMap'

export default function App() {
  const { ready, tripId, mode, online } = useTrip()

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="animate-pulse text-4xl">🎣</span>
      </div>
    )
  }

  // Session wird erst nach Profil-Anlage gesetzt → ohne tripId ins Onboarding
  if (!tripId) return <Onboarding />

  // Zentraler Safe-Area-Fix (iPhone Notch/Dynamic Island) + Platz für den
  // fixierten Offline-/Demo-Banner. Gilt für ALLE Screens, da alle hier drin rendern.
  const bannerExtra = !online || mode === 'local' ? '2.25rem' : '0.5rem'
  return (
    <div className="min-h-dvh" style={{ paddingTop: `calc(env(safe-area-inset-top) + ${bannerExtra})` }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/catches" element={<Catches />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/more" element={<More />} />
        <Route path="/team" element={<Team />} />
        <Route path="/packing" element={<Packing />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/fishing" element={<Fishing />} />
        <Route path="/boat" element={<Boat />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/lexicon" element={<Lexicon />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/biteindex" element={<BiteIndex />} />
        <Route path="/depthmap" element={<DepthMap />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
      <Nav />
    </div>
  )
}
