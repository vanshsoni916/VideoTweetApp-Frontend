import { Link } from "react-router-dom";

const formatViews = (views)=>{
    if(views>=1000000)return `${(views/1000000).toFixed(1)}M views`
    if(views>=1000)return `${(views/1000).toFixed(1)}K views`

    return `${views}views`
}

const formatDate = (date)=>{
    return new Date(date).toLocaleDateString('en-IN',{
        year:'numeric',
        month:'short',
        day:'numeric'
    })
}

const VideoCard = ({ video }) => {
  return (
    <Link to={`/video/${video._id}`} className="group flex flex-col gap-2">

      {/* thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* video info */}
      <div className="flex gap-3">

        {/* channel avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-700 shrink-0 mt-0.5">
          {video.owner?.avatar ? (
            <img
              src={video.owner.avatar.url}
              alt="channel"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
              {video.owner?.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          {/* title */}
          <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-blue-400 transition">
            {video.title}
          </h3>
          {/* channel name */}
          <p className="text-gray-400 text-xs">{video.owner?.fullName}</p>
          {/* views and date */}
          <p className="text-gray-500 text-xs">
            {formatViews(video.views)} · {formatDate(video.createdAt)}
          </p>
        </div>

      </div>

    </Link>
  )
}

export default VideoCard