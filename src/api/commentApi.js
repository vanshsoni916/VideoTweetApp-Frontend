import axiosInstance from './axiosInstance'

export const getVideoComments = async(videoId,page=1,limit=10)=>{
    const response  = await axiosInstance.get(`/comments/video/${videoId}/comments`,{
        params:{page,limit}
    })

    return response.data.data.result
}

export const addComment = async(videoId,content)=>{
    const response = await axiosInstance.post(`/comments/video/${videoId}/comments`,{content})
    return response.data.data
}

export const deleteComment = async(commentId)=>{
    const response = await axiosInstance.delete(`/comments/comment/${commentId}`)

    return response.data.data
}