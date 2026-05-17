import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Searchbar from './Searchbar'

const Navbar = () => {

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between fixed top-0 left-0 z-50">

      <Link to="/" className="text-white font-bold text-xl tracking-tight">
        Video<span className="text-blue-500">Tweet</span>
      </Link>


      <div className="hidden md:flex flex-1 mx-6 max-w-sm">
        <Searchbar />
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
            {user?.avatar ? (
              <img
                src={user.avatar.url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-white text-sm font-medium hidden md:block">
            {user?.fullName}
          </span>
          <span className="text-gray-400 text-xs">{dropdownOpen ? '▲' : '▼'}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">

            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white text-sm font-semibold">{user?.fullName}</p>
              <p className="text-gray-400 text-xs">@{user?.username}</p>
            </div>

            <Link
              to={`/profile/${user?.username}`}
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              My Profile
            </Link>

            <Link
              to="/upload"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              Upload Video
            </Link>
            
            <Link
              to="/tweets"
              onClick={()=> setDropdownOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              Tweets
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition"
            >
              Logout
            </button>

          </div>
        )}
      </div>

    </nav>
  )
}

export default Navbar