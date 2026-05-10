import axiosInstance from "./axiosInstance";

export const toggleSubcription = async (channelId) => {
    const response = await axiosInstance.post(`/subscriptions/c/${channelId}`)
    return response.data.data || []
}