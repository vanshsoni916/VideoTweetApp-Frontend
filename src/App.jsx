import { lazy, Suspense } from "react"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute.jsx"))
const Login = lazy(() => import("./pages/Login.jsx"))
const Register = lazy(() => import("./pages/Register.jsx"))
import { useAuth } from "./context/AuthContext.jsx"
const Layout = lazy(() => import("./components/Layout.jsx"))
const Home = lazy(() => import("./pages/Home.jsx"))
const VideoPlayer = lazy(() => import("./pages/VideoPlayer.jsx"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"))
const UploadVideo = lazy(() => import("./pages/UploadVideo.jsx"))
const SearchResult = lazy(() => import("./pages/SearchResult.jsx"))
const Profile = lazy(() => import("./pages/Profilepage.jsx"))
import { Navigate } from "react-router-dom"
const Dashboard = lazy(()=> import("./pages/Dashboard.jsx"))
const Tweet = lazy(() => import("./pages/Tweet.jsx"))

const ProfileRedirect = () => {
  const { user } = useAuth()
  return <Navigate to={`/profile/${user?.username}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }>
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

          <Route path="/tweets" element={
            <ProtectedRoute>
              <Layout>
                <Tweet />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard/>
              </Layout>
            </ProtectedRoute>
          }/>

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App