import { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom'
import { useAuth } from "../context/AuthContext"
import { getVideoById } from "../api/videoApi.js"
import { getVideoComments, addComment, deleteComment } from "../api/commentApi.js"
import { toggleVideoLike, videoLikeStatus } from "../api/likeApi.js"
import toast from 'react-hot-toast'

const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`

    return `${views}views`
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const VideoPlayer = () => {
    const { videoId } = useParams()
    const { user } = useAuth()

    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)

    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)
    const [addingComment, setAddingComment] = useState(false)

    useEffect(() => {
        fetchVideo()
        fetchComments()
    }, [videoId])

    const fetchVideo = async () => {
        try {
            setLoading(true)
            const data = await getVideoById(videoId)
            setVideo(data)
            const likeData = await videoLikeStatus(videoId)
            setLiked(likeData.isLiked || false)
            setLikeCount(likeData.likes || 0)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Load Video")
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        try {
            setCommentLoading(true)
            const data = await getVideoComments(videoId)
            setComments(data.docs || [])
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Load Comments")
        } finally {
            setCommentLoading(false)
        }
    }

    const handleLike = async () => {
        try {
            setLiked(prev => !prev)
            setLikeCount(prev => liked ? prev - 1 : prev + 1)
            await toggleVideoLike(videoId)
        } catch (error) {
            setLiked(prev => !prev)
            setLikeCount(prev => liked ? prev + 1 : prev - 1)
            toast.error(error.response?.data?.message || "Failed to Toggle Like")
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!commentText.trim()) return
        try {
            setAddingComment(true)
            const newComment = await addComment(videoId, commentText)
            setComments(prev => [newComment, ...prev])
            setCommentText('')
            toast.success("Comment Added Successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add comment")
        } finally {
            setAddingComment(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId)
            setComments(prev => prev.filter(c => c._id !== commentId))
            toast.success("comment deleted successfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete comment")
        }
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-6 animate-pulse">
                <div className="w-full aspect-video rounded-2xl bg-gray-800 mb-4" />
                <div className="h-6 bg-gray-800 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
        )
    }

    if (!video) return null

    return (
        <div className="max-w-5xl mx-auto px-6 py-6">

            {/* video player */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black mb-4">
                <video
                    src={video.videoFile?.url}
                    controls
                    autoPlay
                    className="w-full h-full"
                />
            </div>

            {/* title */}
            <h1 className="text-white text-xl font-semibold mb-2">{video.title}</h1>

            {/* meta row — views, date, like button */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <p className="text-gray-400 text-sm">
                    {formatViews(video.views)} views · {formatDate(video.createdAt)}
                </p>

                {/* like button */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition
            ${liked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-transparent border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400'
                        }`}
                >
                    {liked ? '👍' : '👍'} {likeCount} {liked ? 'Liked' : 'Like'}
                </button>
            </div>

            {/* channel info */}
            <div className="flex items-center gap-3 py-4 border-t border-b border-gray-800 mb-6">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700 shrink-0">
                    {video.owner?.avatar?.url ? (
                        <img src={video.owner.avatar.url} alt="channel" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                            {video.owner?.fullName?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-white font-medium text-sm">{video.owner?.fullName}</p>
                    <p className="text-gray-400 text-xs">@{video.owner?.username}</p>
                </div>
            </div>

            {/* description */}
            {video.description && (
                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed">{video.description}</p>
                </div>
            )}

            {/* comments section */}
            <div>
                <h2 className="text-white font-semibold text-lg mb-4">
                    Comments ({comments.length})
                </h2>

                {/* add comment form */}
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 shrink-0">
                        {user?.avatar?.url ? (
                            <img src={user.avatar.url} alt="you" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="bg-transparent border-b border-gray-700 focus:border-blue-500 text-white text-sm py-2 outline-none placeholder-gray-500 transition w-full"
                        />
                        {commentText.trim() && (
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCommentText('')}
                                    className="text-gray-400 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingComment}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition"
                                >
                                    {addingComment ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        )}
                    </div>
                </form>

                {/* comments list */}
                {commentLoading ? (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-gray-800 shrink-0" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="h-3 bg-gray-800 rounded w-1/4" />
                                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-3">

                                {/* commenter avatar */}
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 shrink-0">
                                    {comment.owner?.avatar?.url ? (
                                        <img src={comment.owner.avatar.url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                                            {comment.owner?.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white text-xs font-medium">{comment.owner?.fullName}</span>
                                        <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">{comment.content}</p>

                                    {/* delete button — only show for comment owner */}
                                    {comment.owner?._id === user?._id && (
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="text-red-400 text-xs mt-1 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default VideoPlayer