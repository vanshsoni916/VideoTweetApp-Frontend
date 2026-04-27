import { useEffect,useState } from "react";
import { getAllVideos } from "../api/videoApi";
import VideoCard from "../components/Videocard";
import toast from "react-hot-toast";


const Home=()=>{

  const [videos,setVideos] = useState([])
  const [loading,setLoading] = useState(true)
  const [hasMore,setHasMore] = useState(true)
  const [page,setPage] = useState(1)
  const [query,setQuery] = useState('')

  useEffect(()=>{
      fetchVideos(1,query,true)
  },[])

  const fetchVideos =async(pageNum,searchQuery,reset=false)=>{
      try{
          setLoading(true)
          const data = await getAllVideos(pageNum,10,searchQuery)

          if(reset){
              setVideos(data.docs || [])
          }
          else{
              setVideos(prev=>[...prev, ...(data.docs || [])])
          }

          setHasMore(data.hasNextPage || false)
          setPage(pageNum)
      } catch(error){
          toast.error("Failed to Load More")
      }finally{
          setLoading(false)
      }
  }

  const handleSearch = (e)=>{
    e.preventDefault()
    fetchVideos(page+1,query)
  }

  const handleLoadMore = ()=>{
      fetchVideos(page+1,query)
  }

  return (
      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* mobile search — hidden on desktop since navbar has it */}
        <form onSubmit={handleSearch} className="flex md:hidden items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6">
          <input
            type="text"
            placeholder="Search videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white text-sm px-4 py-2.5 outline-none w-full placeholder-gray-500"
          />
          <button type="submit" className="px-3 text-gray-400 hover:text-white transition">
            &#128269;
          </button>
        </form>

        {/* loading state */}
        {loading && videos.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="w-full aspect-video rounded-xl bg-gray-800" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-800 shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-gray-400 text-lg">No videos found</p>
            <p className="text-gray-600 text-sm">Be the first to upload one!</p>
          </div>
        )}

        {/* video grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}

        {/* load more button */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-6 py-2.5 rounded-lg border border-gray-700 transition"
            >
              Load More
            </button>
          </div>
        )}

        {/* loading more spinner */}
        {loading && videos.length > 0 && (
          <div className="flex justify-center mt-10">
            <p className="text-gray-500 text-sm">Loading more...</p>
          </div>
        )}

      </div>
    )
}
  
export default Home