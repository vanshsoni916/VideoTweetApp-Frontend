import axiosInstance from "./axiosInstance";

export const forgetPassword = async(email)=>{
    const response = await axiosInstance.post(`/users/forget-password`,{email})

    return response.data
}

export const verifyOtp = async(email,otp)=>{
    const response = await axiosInstance.post('/users/verify-otp',{email,otp})
    return response.data
}

export const resetPassword = async(email,otp,newPassword)=>{
    const response = await axiosInstance.post('/users/reset-password',{email,otp,newPassword})
    return response.data
}