import axiosInstance from "./axiosInstance.js"

export const getUserTweets = async (userId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/tweets/user/${userId}`, {
        params: { page, limit }
    })

    return response.data.data
}

export const createTweet = async (content) => {
    const response = await axiosInstance.post(`/tweets/`, { content })
    return response.data.data
}

export const updateTweet = async (tweetId, content) => {
    const response = await axiosInstance.patch(`/tweets/${tweetId}`, { content })
    return response.data.data
}

export const deleteTweet = async () => {
    const response = await axiosInstance.delete(`/tweets/${tweetId}`)
    return response.data.data
}

export const getTweetsFeed = async(page=1,limit=10)=>{
    const response = await axiosInstance.get('/tweets/feed',{
        params:{page,limit}
    })

    return response.data.data
}