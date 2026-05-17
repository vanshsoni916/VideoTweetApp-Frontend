import {getUserTweets,createTweet,updateTweet,deleteTweet,getTweetsFeed} from '../api/tweetApi.js'
import {useState,useEffect} from 'react'
import toast from 'react-hot-toast'
import {useAuth} from '../context/AuthContext.jsx'
import TweetCard from '../components/TweetCard.jsx'

const Tweet = ()=>{
    const {user} = useAuth()

    const [content,setContent] = useState('')
    const [loading,setLoading] = useState(true)
    const [tweets,setTweets] = useState([])
    const [page,setPage] = useState(1)
    const [hasMore,setHasMore] = useState(true)
    const [loadingMore,setLoadingMore] = useState(false)
    const [posting, setPosting] = useState(false)

    useEffect(()=>{
        fetchTweets(1,true)
    },[])

    const fetchTweets = async(pageNum,reset=false)=>{
        try {
            if(pageNum===1)setLoading(true)
            else setLoadingMore(true)

            const data = await getTweetsFeed(pageNum)
            const fetchedTweets = data.tweets || []

            if(reset){
                setTweets(fetchedTweets)
            }
            else{
                setTweets(prev=>[...prev,...fetchedTweets])
            }

            setHasMore(fetchedTweets.length===10)
            setPage(pageNum)
        } catch (error) {
            if(error.response?.status===404){
                setTweets([])
                setHasMore(false)
            }
            else{
                toast.error("failed to load tweets")
            }
        } finally{
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleCreateTweet = async(e)=>{
        e.preventDefault()
        if(!content.trim())return
        if(content.length>400){
            toast.error("Tweets must be under 400 characters")
            return
        }
        try {
           setPosting(true)
           const  newTweet = await createTweet(content.trim())
           const TweetWithOwner = {
            ...newTweet,
            owner:{
                _id:user._id,
                username:user.username,
                fullname:user.fullname,
                avatar:user.avatar
            },
            isLiked:false,
            likesCount:0
           } 

           setTweets(prev=>[TweetWithOwner,...prev])
           setContent('')
           toast.success("Tweet Posted !")
        } catch (error) {
            toast.error(error.response?.data?.message || 'failed to post tweet')
        } finally{
            setPosting(false)
        }
    }

    const handleDelete = async(tweetId)=>{
        try {
            await deleteTweet(tweetId)
            setTweets(prev=>prev.filter(t=>t._id!==tweetId))
            toast.success("Tweet Deleted Successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || 'failed to delete tweet')
        }
    }

    const handleUpdate = async(tweetId,newContent)=>{
        try {
            await updateTweet(tweetId,newContent)
            setTweets(prev=>prev.map(t=>t._id===tweetId?{...t,content:newContent}:t))
            toast.success("Tweet Updated Successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || 'failed to update tweet')
            throw error
        }
    }

    return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* page header */}
      <h1 className="text-white text-xl font-bold mb-6">Tweets</h1>

      {/* compose tweet box */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex gap-3">

          {/* your avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="you"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={400}
              rows={3}
              className="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500 resize-none"
            />

            {/* compose footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <span className={`text-xs transition ${
                  content.length > 300
                    ? content.length > 340
                      ? 'text-red-400 font-semibold'
                      : 'text-yellow-400'
                    : 'text-gray-500'
                }`}>
                  {400 - content.length}
                </span>
              </div>
              <button
                onClick={handleCreateTweet}
                disabled={posting || !content.trim() || content.length > 350}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-full transition"
              >
                {posting ? 'Posting...' : 'Tweet'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="flex gap-2">
                  <div className="h-3 bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-700 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && tweets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="text-4xl">🐦</div>
          <p className="text-gray-400 text-lg">No tweets yet</p>
          <p className="text-gray-600 text-sm">Be the first to post something!</p>
        </div>
      )}

      {/* tweets feed */}
      {!loading && tweets.length > 0 && (
        <div className="flex flex-col gap-4">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              currentUser={user}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* load more button */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchTweets(page + 1)}
            disabled={loadingMore}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-lg border border-gray-700 transition"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

    </div>
  )
}

export default Tweet 