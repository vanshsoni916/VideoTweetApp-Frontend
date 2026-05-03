import { useState,useEffect } from "react";

//debounce method :

const useDebounce = (value,delay=400)=>{
    const [debounceValue,setDebounceValue] = useState(value)

    useEffect(()=>{
        const timer = setTimeout(()=>{
            setDebounceValue(value)
        },delay)

        return ()=> clearTimeout(timer)
    },[delay,value])

    return debounceValue
}

export default useDebounce