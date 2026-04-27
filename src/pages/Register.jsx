import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../api/axiosInstance'

const Register = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullname: " ",
        username:" ",
        email: " ",
        password: " ",
        avatar: null,
        coverImage: null
    })

    const [loading, setLoading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [coverImagePreview, setCoverImagePreview] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            setFormData({ ...formData, avatar: file })
            setAvatarPreview(URL.createObjectURL(file))
        }
    }
    const handleCoverImageChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            setFormData({ ...formData, coverImage: file })
            setCoverImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()

            data.append('fullname', formData.fullname)
            data.append('username', formData.username)
            data.append('email', formData.email)
            data.append('password', formData.password)
            if (formData.avatar) {
                data.append('avatar', formData.avatar)
            }
            if (formData.coverImage) {
                data.append('coverImage', formData.coverImage)
            }

            await axiosInstance.post("/users/register", data,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            )

            toast.success('Account Created , Please Login !')
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 py-10">
            <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">

                <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                <p className="text-gray-400 text-sm mb-6">Join VideoTweetApp today</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div className="relative w-full h-28 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
                        {coverImagePreview ? (
                            <img
                                src={coverImagePreview}
                                alt="cover preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Cover Image</span>
                            </div>
                        )}
                        {/* upload button sits on top of cover */}
                        <label className="absolute bottom-2 right-2 bg-gray-900 text-blue-400 text-xs px-3 py-1 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800 transition">
                            Upload CoverImage
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverImageChange}
                                className="hidden"
                            />
                        </label>

                        {/* avatar sits on top of cover — bottom left */}
                        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-900 overflow-hidden flex items-center justify-center">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="avatar preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-500 text-xs">Photo</span>
                            )}
                        </div>
                    </div>

                    {/* avatar upload link — below cover to account for avatar overlap */}
                    <div className="mt-6 pl-2">
                        <label className="text-blue-400 text-sm cursor-pointer hover:underline">
                            Upload Avatar
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* full name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="johndoe"
                            required
                            className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                        />
                    </div>

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
                        <label className="text-sm text-gray-400">Password</label>
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                </form>

                <p className="text-gray-400 text-sm text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>

            </div>
        </div>
    )
}

export default Register