import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { uploadVideo } from "../api/videoApi.js"
import toast from "react-hot-toast"

const UploadVideo = () => {
    const navigate = useNavigate()

    const [loading, setLoading] = useState()
    const [uploadProgress, setUploadProgress] = useState()

    const [previews, setPreviews] = useState({
        thumbnail: null,
        videoName: null
    })

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoFile: null,
        thumbnail: null,
        isPublished: true
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleVideoChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            setFormData({ ...formData, videoFile: file })
            setPreviews({ ...previews, videoName: file.name })
        }
    }

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            setFormData({ ...formData, thumbnail: file })
            setPreviews({ ...previews, thumbnail: URL.createObjectURL(file) })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.videoFile) {
            toast.error("video file is required")
        }
        if (!formData.thumbnail) {
            toast.error("thumbnail is required")
        }

        setLoading(true)
        setUploadProgress(0)

        try {
            const data = new FormData()

            data.append('title', formData.title)
            data.append('description', formData.description)
            data.append('videoFile', formData.videoFile)
            data.append('thumbnail', formData.thumbnail)
            data.append('isPublished', formData.isPublished.toString())

            await uploadVideo(data)
            toast.success(formData.isPublished ? 'video published successfully' : 'video is saved as draft')

            navigate('/')
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload video")
        } finally {
            setLoading(false)
            setUploadProgress(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-8">

            <h1 className="text-2xl font-bold text-white mb-1">Upload Video</h1>
            <p className="text-gray-400 text-sm mb-8">Publish a new video to your channel</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 font-medium">Video File</label>
                    <label className={`relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition
            ${formData.videoFile
                            ? 'border-blue-500 bg-blue-950'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                        }`}>
                        {formData.videoFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                                    ▶
                                </div>
                                <p className="text-blue-400 text-sm font-medium text-center px-4 truncate max-w-xs">
                                    {previews.videoName}
                                </p>
                                <p className="text-gray-500 text-xs">Click to change</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl">
                                    ▶
                                </div>
                                <p className="text-gray-400 text-sm">Click to select video</p>
                                <p className="text-gray-600 text-xs">MP4, WebM, MOV supported</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 font-medium">Thumbnail</label>
                    <label className="relative w-full aspect-video rounded-xl border-2 border-dashed border-gray-700 bg-gray-800 hover:border-gray-500 cursor-pointer overflow-hidden transition flex items-center justify-center">
                        {previews.thumbnail ? (
                            <>
                                <img
                                    src={previews.thumbnail}
                                    alt="thumbnail preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <p className="text-white text-sm">Click to change</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-2xl">
                                    🖼
                                </div>
                                <p className="text-gray-400 text-sm">Click to select thumbnail</p>
                                <p className="text-gray-600 text-xs">JPG, PNG, WebP supported</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400 font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter video title..."
                        required
                        className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your video..."
                        required
                        rows={4}
                        className="bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-blue-500 transition resize-none"
                    />
                </div>

                {loading && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Uploading to Cloudinary...</span>
                            <span>Please wait</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse w-full" />
                        </div>
                        <p className="text-gray-500 text-xs">
                            Large videos may take a few minutes. Do not close this page.
                        </p>
                    </div>
                )}

                {/* publish toggle */}
                <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-white text-sm font-medium">
                            {formData.isPublished ? 'Publish immediately' : 'Save as draft'}
                        </p>
                        <p className="text-gray-400 text-xs">
                            {formData.isPublished
                                ? 'Video will be visible to everyone'
                                : 'Only you can see this video'
                            }
                        </p>
                    </div>

                    {/* toggle switch */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
    ${formData.isPublished ? 'bg-blue-600' : 'bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
    ${formData.isPublished ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                >
                    {loading ?
                        (formData.isPublished ? 'Publishing...' : 'saving as a draft')
                        : (formData.isPublished ? 'Publish Video' : 'save as a draft')
                    }
                </button>

            </form>
        </div>
    )
}

export default UploadVideo