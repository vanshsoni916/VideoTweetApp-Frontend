import axiosInstance from "./axiosInstance";

export const toggleVideoLike = async(videoId)=>{
    const response = await axiosInstance.patch(`/likes/video/${videoId}`)
    return response.data.data
}

export const videoLikeStatus = async(videoId)=>{
    const response = await axiosInstance.get(`/likes/video/${videoId}`)
    return response.data.data
}

export const toggleTweetLike = async(tweetId)=>{
    const response = await axiosInstance.patch(`/likes/tweet/${tweetId}`)
    return response.data.data
}

export const tweetLikeStatus = async(tweetId)=>{
    const response = await axiosInstance.get(`/likes/tweet/${tweetId}`)
    return response.data.data
}

export const toggleCommentLike = async(commentId)=>{
    const response = await axiosInstance.patch(`/likes/comment/${commentId}`)
    return response.data.data
}

export const commentLikeStatus = async(commentId)=>{
    const response = await axiosInstance.get(`/likes/comment/${commentId}`)
    return response.data.data
}

export const getAllLikedVideos = async(userId,page=1,limit=10)=>{
    const response = await axiosInstance.get(`/likes/user/${userId}`,{
        params:{page,limit}
    })

    return response.data.data
}