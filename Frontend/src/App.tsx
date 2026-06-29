import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MyApplicationsPage from './pages/applicant/MyApplicationsPage'
import ApplicationFormPage from './pages/applicant/ApplicationFormPage'
import ApplicationDetailPage from './pages/applicant/ApplicationDetailPage'
import ReviewQueuePage from './pages/reviewer/ReviewQueuePage'
import ReviewApplicationPage from './pages/reviewer/ReviewApplicationPage'
import './App.css'

function HomeRedirect() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'applicant') {
    return <Navigate to="/applicant/applications" replace />
  }

  return <Navigate to="/reviewer/queue" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/applicant/applications"
          element={
            <ProtectedRoute role="applicant">
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/applications/new"
          element={
            <ProtectedRoute role="applicant">
              <ApplicationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/applications/:id/edit"
          element={
            <ProtectedRoute role="applicant">
              <ApplicationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/applications/:id"
          element={
            <ProtectedRoute role="applicant">
              <ApplicationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/queue"
          element={
            <ProtectedRoute role="reviewer">
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviewer/applications/:id"
          element={
            <ProtectedRoute role="reviewer">
              <ReviewApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
