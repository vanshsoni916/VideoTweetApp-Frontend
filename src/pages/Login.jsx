import { useNavigate, Link } from "react-router-dom";
import { useState } from "react"
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Logged in successfully!')
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">

        {/* heading */}
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm mb-6">Login to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">Password</label>
              <Link to="/forgot-password" className="text-blue-400 text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
export default Login