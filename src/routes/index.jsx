import Dashboard from '../pages/Dashboard'
import Traceability from '../pages/Traceability'
import BatchDetail from '../pages/BatchDetail'
import RiskScoring from '../pages/RiskScoring'
import RiskAnalysis from '../pages/RiskAnalysis'
import PharmacyTrust from '../pages/PharmacyTrust'
import PharmacyDetail from '../pages/PharmacyDetail'
import PharmacyEvents from '../pages/PharmacyEvents'
import PharmacyAlerts from '../pages/PharmacyAlerts'
import PharmacyRegister from '../pages/PharmacyRegister'
import PharmacyAnalytics from '../pages/PharmacyAnalytics'
import Prescriptions from '../pages/Prescriptions'
import PrescriptionIssue from '../pages/PrescriptionIssue'
import PrescriptionDetail from '../pages/PrescriptionDetail'
import PrescriptionVerify from '../pages/PrescriptionVerify'
import PrescriptionHistory from '../pages/PrescriptionHistory'
import Pharmacies from '../pages/Pharmacies'
import Medicines from '../pages/Medicines'
import Alerts from '../pages/Alerts'
import Blockchain from '../pages/Blockchain'
import Settings from '../pages/Settings'

/**
 * Route table consumed by App.jsx. Paths mirror utils/constants.js
 * NAV_ITEMS one-to-one so the sidebar and the router never drift apart.
 */
export const routes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/traceability', element: <Traceability /> },
  { path: '/traceability/:batchId', element: <BatchDetail /> },
  { path: '/risk-scoring', element: <RiskScoring /> },
  { path: '/risk-scoring/:batchId', element: <RiskAnalysis /> },
  { path: '/pharmacy-trust', element: <PharmacyTrust /> },
  { path: '/pharmacy-trust/pharmacy/:id', element: <PharmacyDetail /> },
  { path: '/pharmacy-trust/events', element: <PharmacyEvents /> },
  { path: '/pharmacy-trust/alerts', element: <PharmacyAlerts /> },
  { path: '/pharmacy-trust/register', element: <PharmacyRegister /> },
  { path: '/pharmacy-trust/analytics', element: <PharmacyAnalytics /> },
  { path: '/prescriptions', element: <Prescriptions /> },
  { path: '/prescriptions/issue', element: <PrescriptionIssue /> },
  { path: '/prescriptions/verify', element: <PrescriptionVerify /> },
  { path: '/prescriptions/history', element: <PrescriptionHistory /> },
  { path: '/prescriptions/:id', element: <PrescriptionDetail /> },
  { path: '/pharmacies', element: <Pharmacies /> },
  { path: '/medicines', element: <Medicines /> },
  { path: '/alerts', element: <Alerts /> },
  { path: '/blockchain', element: <Blockchain /> },
  { path: '/settings', element: <Settings /> },
]
