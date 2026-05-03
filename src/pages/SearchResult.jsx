import {useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Videocard from "../components/Videocard.jsx"
import { searchVideos } from '../api/videoApi'

const SearchResult = ()=>{
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [videos,setVideos] = useState([])
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        if(query)fetchVideos()
    },[query])

    const fetchVideos = async()=>{
        try {
            setLoading(true)
            const results = await searchVideos(query)
            setVideos(results)
        } catch (error) {
            toast.error("Search Failed")
        }finally{
            setLoading(false)
        }
    }

    return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      <p className="text-gray-400 text-sm mb-6">
        {loading ? 'Searching...' : `${videos.length} results for `}
        {!loading && <span className="text-white font-medium">"{query}"</span>}
      </p>

      {/* skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="w-full aspect-video rounded-xl bg-gray-800" />
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3 bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* no results */}
      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-gray-400 text-lg">No results found</p>
          <p className="text-gray-600 text-sm">Try different keywords</p>
        </div>
      )}

      {/* results grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((video) => (
            <Videocard key={video._id} video={video} />
          ))}
        </div>
      )}

    </div>
  )
}

export default SearchResult