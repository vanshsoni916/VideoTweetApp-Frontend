import { useContext,useState,useEffect,createContext } from "react";
import axiosInstance from "../api/axiosInstance.js"


const AuthContext = createContext(null)

export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)

    //when app reloads check if user already logged in:
    useEffect(()=>{
        const token = localStorage.getItem('accessToken')

        if(token){
            fetchCurrentUser()
        }
        else{
            setLoading(false)
        }
    },[])

    const fetchCurrentUser = async()=>{
        try{
            const response = await axiosInstance.get("/users/current-user")
            setUser(response.data.data)
        }catch(error){
            console.log(error)
            localStorage.removeItem('accessToken')
            setUser(null)
        }finally{
            setLoading(false)
        }
    }

    const login = async(email,password)=>{
        const response = await axiosInstance.post('/users/login',{email,password})
        const {accessToken,user:loggedUser} = response.data.data 
        localStorage.setItem('accessToken',accessToken)
        setUser(loggedUser)
    }

    const logout = async()=>{
        try{
            await axiosInstance.post('/users/logout')
        }finally{
            localStorage.removeItem('accessToken')
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{user,setUser,loading,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth=()=> useContext(AuthContext)