import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import { useAuth } from "./context/AuthContext.jsx"
import Layout from "./components/Layout.jsx"
import Home from "./pages/Home.jsx"
import VideoPlayer from "./pages/VideoPlayer.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import UploadVideo from "./pages/UploadVideo.jsx"
import SearchResult from "./pages/SearchResult.jsx"
import Profile from "./pages/Profilepage.jsx"
import { Navigate } from "react-router-dom"

const ProfileRedirect = () => {
  const { user } = useAuth()
  return <Navigate to={`/profile/${user?.username}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/video/:videoId" element={
          <ProtectedRoute>
            <Layout>
              <VideoPlayer />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout>
              <UploadVideo />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <SearchResult />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfileRedirect />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App