import {Link} from "react-router-dom"
import {toggleTweetLike,tweetLikeStatus} from '../api/likeApi.js'
import {useState,useEffect} from 'react'
import toast from 'react-hot-toast'

const formatDate = (date) => {
  const now = new Date()
  const created = new Date(date)
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return created.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const TweetCard =({tweet,currentUser,onDelete,onUpdate})=>{
    const [isEditing,setIsEditing] = useState(false)
    const [editContent,setEditContent] = useState(tweet.content)
    const [editLoading,setEditLoading] = useState(false)
    const [showMenu,setShowMenu] = useState(false)
    const [liked,setLiked] = useState(false)
    const [likesCount,setLikeCount] = useState(tweet.likesCount || 0)
    const [likeLoading,setLikeLoading] = useState(false)

    const isOwner = tweet.owner?._id === currentUser?._id

    useEffect(()=>{
        const fetchLikeStatus = async()=>{
           try {
            const data = await tweetLikeStatus(tweet?._id)
            setLiked(data.isLiked)
            setLikeCount(data.likes || 0)
           } catch (error) {
            console.log("the error in likeStatus is :",error)
           } 
        }
        fetchLikeStatus()
    },[tweet?._id])

    //close menu when clicking outside:
    useEffect(()=>{
        const handleClick=()=> setShowMenu(false)
        if(showMenu)document.addEventListener('click',handleClick)
        return ()=>document.removeEventListener('click',handleClick)
    },[showMenu])

    const handleLike = async()=>{
        if(likeLoading)return 

        try {
            setLikeLoading(true)
            const data = await toggleTweetLike(tweet?._id)
            setLiked(prev=>!prev)
            setLikeCount(prev=> liked?prev-1 : prev+1)
            toast.success("Like toggled successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "failed to toggle like")
        } finally{
            setLikeLoading(false)
        }
    }

    const handleUpdate = async()=>{
        if(!editContent.trim())return
        if(editContent.trim()===tweet.content){
            setIsEditing(false)
            return
        }

        if(editContent.trim().length>400){
            toast.error("More than 400 characters are not allowed")
            return
        }
        try {
            setEditLoading(true)
            await onUpdate(tweet?._id,editContent.trim())
            setIsEditing(false)
        } catch (error) {
            console.log("the error in handleUpdate is :",error)
        } finally{
            setEditLoading(false)
        }
    }

    const handleCancelEdit = ()=>{
        setEditContent(tweet.content)
        setIsEditing(false)
    }

    return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 hover:border-gray-700 transition">

      {/* avatar — clickable to profile */}
      <Link
        to={`/profile/${tweet.owner?.username}`}
        className="flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 hover:opacity-80 transition">
          {tweet.owner?.avatar?.url ? (
            <img
              src={tweet.owner.avatar.url}
              alt={tweet.owner?.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
              {tweet.owner?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">

        {/* header row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              to={`/profile/${tweet.owner?.username}`}
              className="text-white text-sm font-semibold hover:underline"
            >
              {tweet.owner?.fullName || tweet.owner?.username}
            </Link>
            <span className="text-gray-500 text-sm">
              @{tweet.owner?.username}
            </span>
            <span className="text-gray-600 text-xs">
              · {formatDate(tweet.createdAt)}
            </span>
          </div>

          {/* 3-dot menu — only for owner */}
          {isOwner && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(prev => !prev)
                }}
                className="text-gray-500 hover:text-white text-xl leading-none px-1.5 py-0.5 rounded-lg hover:bg-gray-800 transition"
              >
                ···
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(tweet._id)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* tweet content or edit mode */}
        {isEditing ? (
          <div className="flex flex-col gap-2 mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={350}
              rows={3}
              autoFocus
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-blue-500 transition resize-none w-full"
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${editContent.length > 300 ? 'text-red-400' : 'text-gray-500'}`}>
                {editContent.length}/350
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={editLoading || !editContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-1.5 rounded-lg transition"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-200 text-sm leading-relaxed break-words mt-0.5">
            {tweet.content}
          </p>
        )}

        {/* actions row — like button */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 text-sm transition
                ${liked
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-gray-500 hover:text-red-400'
                }`}
            >
              <span className="text-base">{liked ? '❤️' : '🤍'}</span>
              <span>{likesCount}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default TweetCard