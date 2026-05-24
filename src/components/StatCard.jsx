import {useState,useEffect} from 'react'

const useCountUp = (target,duration=1500)=>{
    const [count,setCount] = useState(0)

    useEffect(()=>{
        if(!target)return
        let start = 0
        const increment = target/(duration/16)

        const timer = setInterval(()=>{
            start+=increment
            if(start>=target){
                setCount(target)
                clearInterval(timer)
            }
            else{
                setCount(Math.floor(start))
            }
        },16)
        return ()=>clearInterval(timer)
    },[target])

    return count
}
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const StatCard =({label,value,icon,color})=>{
    const count = useCountUp(value)

    return (
    <div className={`relative overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition`}>
      {/* background glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />

      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color} bg-opacity-20`}>
          {icon}
        </div>
      </div>

      <div>
        <p className="text-white text-3xl font-bold tracking-tight">
          {formatNumber(count)}
        </p>
      </div>
    </div>
  )
}

export default StatCard