import {useState,useEffect,useRef} from "react"
import {Link,useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import { getChannelStats,getChannelVideos } from "../api/dashboardApi"
import {togglePublishStatus,deleteVideo} from "../api/videoApi"
import StatCard  from "../components/StatCard"
import toast from 'react-hot-toast'

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const VideoRow = ({ video, onTogglePublish, onDelete, onEdit }) => {
  const [toggling, setToggling] = useState(false)
  const [isPublished, setIsPublished] = useState(video.isPublished)

  const handleToggle = async () => {
    try {
      setToggling(true)
      setIsPublished(prev => !prev)  // optimistic
      await onTogglePublish(video._id)
    } catch (error) {
      setIsPublished(prev => !prev)  // revert
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl transition group">

      {/* thumbnail */}
      <div className="relative w-32 h-18 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 aspect-video">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        {/* duration overlay */}
        <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
        {/* unpublished overlay */}
        {!isPublished && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-gray-300 text-xs font-medium">Draft</span>
          </div>
        )}
      </div>

      {/* video info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="text-white text-sm font-medium line-clamp-1 flex-1">
            {video.title}
          </h3>
        </div>
        <p className="text-gray-500 text-xs mb-2 line-clamp-1">
          {video.description}
        </p>
        <div className="flex items-center gap-3">
          {/* status badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium
            ${isPublished
              ? 'bg-green-900 bg-opacity-50 text-green-400 border border-green-800'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-green-400' : 'bg-gray-500'}`} />
            {isPublished ? 'Published' : 'Draft'}
          </span>
          <span className="text-gray-500 text-xs">{formatDate(video.createdAt)}</span>
        </div>
      </div>

      {/* stats */}
      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white text-sm font-semibold">{formatNumber(video.views)}</span>
          <span className="text-gray-500 text-xs">Views</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white text-sm font-semibold">{video.likeCount || 0}</span>
          <span className="text-gray-500 text-xs">Likes</span>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* publish toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={isPublished ? 'Unpublish' : 'Publish'}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50
            ${isPublished ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
            ${isPublished ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>

        {/* edit button */}
        <Link
          to={`/video/edit/${video._id}`}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition opacity-0 group-hover:opacity-100"
          title="Edit"
        >
          ✏️
        </Link>

        {/* view button */}
        <Link
          to={`/video/${video._id}`}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition opacity-0 group-hover:opacity-100"
          title="View"
        >
          👁
        </Link>

        {/* delete button */}
        <button
          onClick={() => onDelete(video)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          🗑️
        </button>

      </div>
    </div>
  )
}

const DeleteModal = ({ video, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white text-lg font-semibold mb-2">Delete video?</h3>
        <p className="text-gray-400 text-sm mb-1">
          This will permanently delete:
        </p>
        <p className="text-white text-sm font-medium mb-6 bg-gray-800 px-3 py-2 rounded-lg">
          "{video.title}"
        </p>
        <p className="text-red-400 text-xs mb-6">
          This action cannot be undone. The video will be removed from Cloudinary too.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

const Dashboard = ()=>{
    const {user} = useAuth()
    const navigate = useNavigate()
    const [stats,setStats] = useState(null)
    const [videos,setVideos] = useState([])
    const [statsLoading,setStatsLoading] = useState(true)
    const [videoLoading,setVideoLoading] = useState(true)
    const [deleteModal,setDeleteModal] = useState(null)
    const [deleting,setDeleting] = useState(false)
    const[page,setPage] = useState(1)
    const [hasMore,setHasMore] = useState(true)
    const [filter,setFilter] = useState('all')

    useEffect(()=>{
        if(user?._id){
            fetchStats()
            fetchVideos(1,true)
        }
    },[user])

    const fetchStats = async()=>{
        try {
            setStatsLoading(true)
            const data =await getChannelStats(user?._id)
            setStats(data)
        } catch (error) {
            toast.error("failed to set channel stats")
        } finally{
            setStatsLoading(false)
        }
    }

    const fetchVideos = async(pageNum,reset=false)=>{
        try {
            setVideoLoading(true)
            const data = await getChannelVideos(user?._id,pageNum)
            const fetchedVideos = data.docs || []

            if(reset){
                setVideos(fetchedVideos)
            }
            else{
                setVideos(prev=>[...prev,...fetchedVideos])
            }

            setHasMore(data.hasNextPage || false)
            setPage(pageNum)
        } catch (error) {
            toast.error("Failed to load videos")
        } finally{
            setVideoLoading(false)
        }
    }

    const handleTogglePublish = async(videoId)=>{
        try {
            await togglePublishStatus(videoId)
            toast.success('Publish status updated')
        } catch (error) {
            toast.error('Failed to update publish status')
            throw error
        }
    }

    const handleDeleteConfirm = async()=>{
        if(!deleteModal)return 
        try {
            setDeleting(true)
            await deleteVideo(deleteModal?._id)
            setVideos(prev=> prev.filter(v=>v._id!==deleteModal._id))
            toast.success('video deleted successfully')
            setDeleteModal(null)
            fetchStats()
        } catch (error) {
            toast.error(error.response?.data?.message || 'failed to delete video')
        } finally{
            setDeleting(false)
        }
    }

    const filteredVideos = videos.filter(v=> {
        if(filter === 'published')return v.isPublished
        if(filter === 'draft') return !v.isPublished
        return true
    })
    
    return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* delete modal */}
      {deleteModal && (
        <DeleteModal
          video={deleteModal}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your channel and content
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          <span className="text-lg leading-none">+</span>
          Upload Video
        </Link>
      </div>

      {/* stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Videos"
            value={stats?.totalVideos || 0}
            icon="🎬"
            color="bg-blue-500"
          />
          <StatCard
            label="Total Views"
            value={stats?.totalViews || 0}
            icon="👁"
            color="bg-purple-500"
          />
          <StatCard
            label="Total Likes"
            value={stats?.totalLikes || 0}
            icon="❤️"
            color="bg-red-500"
          />
          <StatCard
            label="Subscribers"
            value={stats?.totalSubscribers || 0}
            icon="👥"
            color="bg-green-500"
          />
        </div>
      )}

      {/* videos section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

        {/* section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Your Videos</h2>

          {/* filter tabs */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-1">
            {['all', 'published', 'draft'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition
                  ${filter === f
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* videos list */}
        {videoLoading ? (
          <div className="flex flex-col divide-y divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-32 aspect-video rounded-lg bg-gray-700 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">🎬</div>
            <p className="text-gray-400 text-lg font-medium">
              {filter === 'all' ? 'No videos yet' : `No ${filter} videos`}
            </p>
            <p className="text-gray-600 text-sm">
              {filter === 'all' && 'Upload your first video to get started'}
            </p>
            {filter === 'all' && (
              <Link
                to="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl transition mt-2"
              >
                Upload Video
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-800">
            {filteredVideos.map((video) => (
              <VideoRow
                key={video._id}
                video={video}
                onTogglePublish={handleTogglePublish}
                onDelete={setDeleteModal}
                onEdit={(v) => navigate(`/video/edit/${v._id}`)}
              />
            ))}
          </div>
        )}

        {/* load more */}
        {hasMore && !videoLoading && filter === 'all' && (
          <div className="flex justify-center p-4 border-t border-gray-800">
            <button
              onClick={() => fetchVideos(page + 1)}
              className="text-blue-400 hover:text-blue-300 text-sm transition"
            >
              Load more videos
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard