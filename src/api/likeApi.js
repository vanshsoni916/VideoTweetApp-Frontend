import axiosInstance from "./axiosInstance";

export const toggleVideoLike = async(videoId)=>{
    const response = await axiosInstance.patch(`/likes/video/${videoId}`)
    return response.data.data
}

export const videoLikeStatus = async(videoId)=>{
    const response = await axiosInstance.get(`/likes/video/${videoId}`)
    return response.data.data
}