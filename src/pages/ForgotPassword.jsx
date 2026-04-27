import { useState } from "react";
import { forgetPassword, verifyOtp, resetPassword } from "../api/authApi.js"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast";

const ForgotPassword = () => {
    const navigate = useNavigate()
    //i have to track in which step i am :
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    //step-1 :
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await forgetPassword(email)
            toast.success("OTP sent to your email")
            setStep(2)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send Otp")
        } finally {
            setLoading(false)
        }
    }

    //step-2:
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await verifyOtp(email, otp)
            toast.success("OTP verified!")
            setStep(3)
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or Expired Otp")
        } finally {
            setLoading(false)
        }
    }

    //step-3:
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("confirm password do not match with new password")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be atLeast 6 characters")
            return
        }

        setLoading(true)

        try {
            await resetPassword(email, otp, newPassword)
            toast.success("Password is reset successfully")
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">

                {/* step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition
                ${step === s
                                    ? 'bg-blue-600 text-white'
                                    : step > s
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-400'
                                }`}>
                                {step > s ? '✓' : s}
                            </div>
                            {s < 3 && (
                                <div className={`h-0.5 w-10 rounded transition ${step > s ? 'bg-green-600' : 'bg-gray-700'}`} />
                            )}
                        </div>
                    ))}
                    <span className="ml-2 text-gray-400 text-xs">
                        {step === 1 && 'Enter email'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'New password'}
                    </span>
                </div>

                {/* ── Step 1 ── */}
                {step === 1 && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-1">Forgot password?</h1>
                        <p className="text-gray-400 text-sm mb-6">
                            Enter your email and we'll send you a 6-digit OTP
                        </p>

                        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </>
                )}

                {/* ── Step 2 ── */}
                {step === 2 && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-1">Check your email</h1>
                        <p className="text-gray-400 text-sm mb-6">
                            We sent a 6-digit OTP to <span className="text-white font-medium">{email}</span>. It expires in 4 minutes.
                        </p>

                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    required
                                    maxLength={6}
                                    className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition tracking-widest text-center  font-semibold"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            {/* resend OTP */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOtp('')
                                    handleSendOtp({ preventDefault: () => { } })
                                }}
                                className="text-blue-400 text-sm hover:underline text-center"
                            >
                                Resend OTP
                            </button>
                        </form>
                    </>
                )}

                {/* ── Step 3 ── */}
                {step === 3 && (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
                        <p className="text-gray-400 text-sm mb-6">
                            Choose a strong password for your account
                        </p>

                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                                />
                                {/* live password match feedback */}
                                {confirmPassword && (
                                    <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}

                {/* back to login */}
                <p className="text-gray-400 text-sm text-center mt-6">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>

            </div>
        </div>
    )
}

export default ForgotPassword