import axiosInstance from "./axiosInstance";

export const getAllVideos = async(page=1,limit=10,query='')=>{
    const response = await axiosInstance.get('/videos/search',{
        params:{page,limit,query}
    })

    return response.data.data
}

export const getVideoById = async(videoId)=>{
    const response = await axiosInstance.get(`/videos/c/${videoId}`)
    return response.data.data
}

export const uploadVideo = async(formData)=>{
    const response = await axiosInstance.post('/videos/publish',formData,{
        headers:{"Content-Type":"multipart/form-data"}
    })

    return response.data.data
}

export const updateVideo = async(videoId,formData)=>{
    const response = await axiosInstance.patch(`/videos/c/${videoId}`,formData,
        {
            headers:{'Content-Type':'multipart/form-data'}
        }
    )
    return response.data.data
}

export const deleteVideo = async(videoId)=>{
    const response = await axiosInstance.delete(`/videos/c/${videoId}`)
    return response.data.data
}

export const togglePublishStatus = async(videoId)=>{
    const response = await axiosInstance.patch(`/videos/c/${videoId}/toggle_publish`)
    return response.data.data
}

export const searchVideos = async(query)=>{
    const broadQuery = query.slice(0,3)

    const response = await axiosInstance.get('/videos/search',{
        params :{page:1,limit:50,query:broadQuery}
    })

    return response.data.data.docs || [] 
}