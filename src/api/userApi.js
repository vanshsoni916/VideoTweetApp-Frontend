import axiosInstance from "./axiosInstance";

export const getuserChannelProfile = async (username) => {
    const response = await axiosInstance.get(`/users/c/${username}`)

    return response.data.data || []
}