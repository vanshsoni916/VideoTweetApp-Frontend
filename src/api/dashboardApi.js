import axiosInstance from "../api/axiosInstance.js"

export const getChannelStats = async(channelId)=>{
    const response = await axiosInstance.get(`/dashboard/stats/${channelId}`)

    return response.data.data
}

export const getChannelVideos = async(channelId,page=1,limit=10)=>{
    const response = await axiosInstance.get(`/dashboard/videos/${channelId}`,{
        params:{page,limit}
    })

    return response.data.data
}