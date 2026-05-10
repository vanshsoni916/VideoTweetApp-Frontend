import { useState, useEffect, useRef } from 'react'
import { searchVideos } from "../api/videoApi.js"
import useDebounce from "../hooks/useDebounce.js"
import { useNavigate } from "react-router-dom"
import Fuse from 'fuse.js'

//levenshtein Algorithm:
const levenshtein = (str1, str2) => {
  const m = str1.length
  const n = str2.length

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  //first row:
  for (let i = 0; i <= m; i++)dp[0][i] = i
  //first column:
  for (let j = 0; j <= n; j++)dp[j][0] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      }
      else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}

const isFuzzyMatch = (query, title, maxDistance = 3) => {
  query = query.toLowerCase()
  title = title.toLowerCase()

  if (title.includes(query)) return true

  const words = title.split(' ') //words:array of strings:
  return words.some(word => { //return boolean result true if condition matched 
    const distance = levenshtein(query, word)
    return distance <= maxDistance
  })
}

const Searchbar = () => {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [dropDown, setDropDown] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  const debounceQuery = useDebounce(query)

  // now detect whether the event hit on the search bar or outside the search bar:

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropDown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debounceQuery.trim()) {
      setSuggestions([])
      setDropDown(false)
      return
    }
    fetchSuggestions(debounceQuery)
  }, [debounceQuery])

  //now fetchSuggestions :

  const fetchSuggestions = async (searchQuery) => {
    try {
      setLoading(true)
      const videos = await searchVideos(searchQuery)
      // const fuse = new Fuse(videos,{
      //     keys:['title','description','owner.username'],
      //     threshold:0.4,
      //     includeScore:true,
      //     minMatchCharLength:2
      // })

      // const fuzzySearch = fuse.search(searchQuery)

      // const finalResult = fuzzySearch.length>0?(fuzzySearch.map(r=>r.item)):videos

      //let's apply Levenshtein Algorithm for better search :


      //now add final result inside the suggestions:

      // const fuzzyMatch = videos.filter(video =>
      //   isFuzzyMatch(searchQuery, video.title)
      // )

      // const sorted = fuzzyMatch.sort((a, b) => {
      //   const distA = levenshtein(
      //     searchQuery.toLowerCase(),
      //     a.title.toLowerCase()
      //   )
      //   const distB = levenshtein(
      //     searchQuery.toLowerCase(),
      //     b.title.toLowerCase()
      //   )

      //   return distA - distB
      // })

      setSuggestions(videos.slice(0, 6))
      setDropDown(videos.length > 0)

    } catch (error) {
      console.log('Search Failed ', error)
    } finally {
      setLoading(false)
      setDropDown(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setDropDown(false)
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSuggestionClick = (video) => {
    setDropDown(false)
    setQuery(video.title)
    navigate(`/video/${video._id}`)
  }

  const formatDuration = (duration) => {
    if (!duration) {
      return ''
    }

    return `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">

      {/* search input */}
      <form onSubmit={handleSubmit} className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:border-blue-500 transition">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setDropDown(true)}
          placeholder="Search videos..."
          className="bg-transparent text-white text-sm px-4 py-2 outline-none w-full placeholder-gray-500"
        />

        {/* clear button — shows when there is text */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setDropDown(false)
            }}
            className="px-2 text-gray-500 hover:text-white transition text-lg leading-none"
          >
            ✕
          </button>
        )}

        {/* search button */}
        <button
          type="submit"
          className="px-3 py-2 text-gray-400 hover:text-white transition border-l border-gray-700"
        >
          {loading ? (
            <span className="block w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
          ) : (
            <span>&#128269;</span>
          )}
        </button>
      </form>

      {/* suggestions dropdown */}
      {dropDown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-xl">

          {suggestions.map((video) => (
            <button
              key={video._id}
              onClick={() => handleSuggestionClick(video)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 transition text-left"
            >
              {/* thumbnail */}
              <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                <img
                  src={video.thumbnail?.url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {video.duration && (
                  <span className="absolute bottom-0.5 right-0.5 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* title and channel */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                  {video.title}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  {video.owner?.username}
                </p>
              </div>

            </button>
          ))}

          {/* view all results */}
          <button
            onClick={handleSubmit}
            className="w-full px-3 py-2.5 text-blue-400 text-xs hover:bg-gray-800 transition border-t border-gray-800 text-center"
          >
            View all results for "{query}"
          </button>

        </div>
      )}

      {/* no results */}
      {dropDown && !loading && query && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl z-50 shadow-xl">
          <p className="text-gray-500 text-sm px-4 py-3 text-center">
            No results for "{query}"
          </p>
        </div>
      )}

    </div>
  )
}

export default Searchbar