import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from "../context/AuthContext"
import { toggleSubcription } from '../api/subscriptionApi'
import { getUserVideos } from '../api/videoApi.js'
import { getuserChannelProfile } from '../api/userApi.js'
import VideoCard from "../components/Videocard.jsx"
import toast from "react-hot-toast"

const Profile = () => {
    const { username } = useParams()
    const { user } = useAuth()
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingVideos, setLoadingVideos] = useState(true)
    const [subscribersCount, setSubscriberCount] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscribing, setSubscribing] = useState(false)
    const [activeTab, setActiveTab] = useState('videos')
    const [channel, setChannel] = useState(null)

    useEffect(() => {
        fetchChannel()
    }, [username])

    const fetchChannel = async () => {
        try {
            setLoading(true)
            const data = await getuserChannelProfile(username)
            setChannel(data)
            setIsSubscribed(data.isSubscribed)
            setSubscriberCount(data.subscribersCount)
            fetchVideos(data._id)
        } catch (error) {
            toast.error(error.response?.data?.message || 'channel not found')
        } finally {
            setLoading(false)
        }
    }

    const fetchVideos = async (userId) => {
        try {
            setLoadingVideos(true)
            const data = await getUserVideos(userId)
            setVideos(data.docs || [])
        } catch (error) {
            console.log("error: ", error)
            toast.error('failed to load videos')
        } finally {
            setLoadingVideos(false)
        }
    }

    const handleSubscribe = async () => {
        try {
            setSubscribing(true)
            setIsSubscribed(prev => !prev)
            setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1)
            await toggleSubcription(channel?._id)
        } catch (error) {
            toast.error('Failed to update subscriptions')
        } finally {
            setSubscribing(false)
        }
    }

    const isOwnProfile = user?.username === username

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="w-full h-48 bg-gray-800" />
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-end gap-4 -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-gray-950 flex-shrink-0" />
                        <div className="flex flex-col gap-2 pb-2">
                            <div className="h-5 bg-gray-700 rounded w-40" />
                            <div className="h-3 bg-gray-700 rounded w-24" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!channel) {
        return null
    }

    return (
        <div>

            {/* cover image */}
            <div className="w-full h-48 md:h-64 bg-gray-800 overflow-hidden">
                {channel.coverImage?.url ? (
                    <img
                        src={channel.coverImage.url}
                        alt="cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-700" />
                )}
            </div>

            <div className="max-w-5xl mx-auto px-6">

                {/* profile info row */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-6">

                    <div className="flex items-end gap-4">
                        {/* avatar */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-950 bg-gray-700 flex-shrink-0">
                            {channel.avatar?.url ? (
                                <img
                                    src={channel.avatar.url}
                                    alt={channel.fullname}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                                    {channel.fullname?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* name and stats */}
                        <div className="flex flex-col gap-1 pb-1">
                            <h1 className="text-white text-xl font-bold">
                                {channel.fullname}
                            </h1>
                            <p className="text-gray-400 text-sm">@{channel.username}</p>
                            <div className="flex items-center gap-3 text-gray-400 text-xs">
                                <span>{subscribersCount} subscribers</span>
                                <span>·</span>
                                <span>{channel.channelSubscribedToCount} subscribed</span>
                                <span>·</span>
                                <span>{videos.length} videos</span>
                            </div>
                        </div>
                    </div>

                    {/* action buttons */}
                    <div className="flex items-center gap-3 pb-1">
                        {isOwnProfile ? (
                            // own profile — show edit button
                            <Link
                                to="/settings"
                                className="px-5 py-2 rounded-lg border border-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition"
                            >
                                Edit Profile
                            </Link>
                        ) : (
                            // other user's profile — show subscribe button
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50
                  ${isSubscribed
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                {subscribing
                                    ? '...'
                                    : isSubscribed ? 'Subscribed' : 'Subscribe'
                                }
                            </button>
                        )}
                    </div>

                </div>

                {/* tabs */}
                <div className="flex border-b border-gray-800 mb-6">
                    {['videos', 'about'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px
                ${activeTab === tab
                                    ? 'border-white text-white'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* tab content */}

                {/* videos tab */}
                {activeTab === 'videos' && (
                    <div className="pb-10">
                        {loadingVideos ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2 animate-pulse">
                                        <div className="w-full aspect-video rounded-xl bg-gray-800" />
                                        <div className="h-3 bg-gray-800 rounded w-3/4" />
                                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : videos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <p className="text-gray-400">No videos yet</p>
                                {isOwnProfile && (
                                    <Link
                                        to="/upload"
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
                                    >
                                        Upload your first video
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {videos.map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* about tab */}
                {activeTab === 'about' && (
                    <div className="pb-10 max-w-xl">
                        <div className="flex flex-col gap-4">

                            <div className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3">

                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Email</p>
                                    <p className="text-white text-sm">{channel.email}</p>
                                </div>

                                <div className="border-t border-gray-800" />

                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Subscribers</p>
                                    <p className="text-white text-sm">{subscribersCount}</p>
                                </div>

                                <div className="border-t border-gray-800" />

                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide">Subscribed to</p>
                                    <p className="text-white text-sm">{channel.channelSubscribedToCount} channels</p>
                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Profile