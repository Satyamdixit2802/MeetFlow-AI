"use client"

import {useState} from "react";
import {signIn} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import Link from 'next/link'
import { toast } from "@/components/ui/toast"
import {MicAudioLines} from 'lucide-react'

import axios from 'axios'




 function  RegisterPage() {
    const router = useRouter() ;
    const [formData,setFormData] =  useState({
        uname: "",
       email: "",
      password: "",
    })
    const [loading, setLoading] = useState(false)

    async function handleRegister() {
      
 
     
       if (!formData.email || !formData.password) {
       toast.add({
            type: "error",
            description: "Enter email and password.",
            priority: "high",
          })
          
      return
    }
       if ( formData.password.length < 6) {
       toast.add({
            type: "error",
            description: "Password length should be greater than 6",
            priority: "high",
          })
          
      return
    }
setLoading(true)
    try {
        await axios.post("/api/auth/register", formData)

       const res = await signIn("credentials", {
         email : formData.email,
         password : formData.password,
         redirect : false,
      })

      if(res?.error){
          toast.add({
            type : "destructive",
           title: "Registered but sign-in failed — try logging in"
         })
        
          router.push("/login")
        return
      }
      router.push("/dashboard")
        
    } catch (err : any) {
        const message = err?.response?.data?.error ?? "Registration failed"
        toast.add({
            type : "destructive",
            title : message
        })
    }finally {
        setLoading(false)
    }



    }

    
    function handleChange(e ) {
      const {name, value} = e.target

      setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
    } 

    return (
      <div className="min-h-[80vh] flex flex-col items-center mx-auto gap-7 px-4 mt-15  max-w-md">
         <div className="flex flex-col items-center justify-around gap-1" >
         <div className=""><MicAudioLines size={55} className="border bg-gray-300 rounded-full p-2 mb-2" /></div>
         <h1 className="text-3xl font-bold ">Create Account</h1>
         <p className="text-lg font-medium tracking-tighter">Start tracking your meetings</p>
         </div>
        
          
      <form className="space-y-4 w-full max-w-md " >
        <div className="w-full  flex flex-col gap-2 ">
            <label htmlFor="uname" className="font-medium">Email</label>
            <input type="uname" name="uname" id="uname"
            placeholder="Name (optional)"
            value={formData.uname}
            onChange={handleChange}
            className="w-full  px-5 py-2 text-md rounded-lg  bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"/>
         </div>
         <div className="w-full  flex flex-col gap-2 ">
            <label htmlFor="email" className="font-medium">Email</label>
            <input type="email" name="email" id="email"
            placeholder="eg. name@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full  px-5 py-2 text-md rounded-lg  bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"/>
         </div>
         <div className="w-full  flex flex-col gap-2 ">
            <label htmlFor="password" className="font-medium">Password</label>
            <input type="password" name="password" id="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
             onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            className="w-full  px-5 py-2 text-md rounded-lg  bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"/>
         </div>
         <Button className="w-full text-lg mt-8 font-medium tracking-tight bg-gray-400 py-5 px-4"
         onClick={handleRegister} 
         disabled ={loading}> {loading ? "Creating Account..." : "Sign up"}</Button>
        
      </form>
        <p className="text-center ">Already have an account?{" "}
            <Link href="/login" className="underline">Sign in</Link>
        </p>
      </div>


    );
}

export default  RegisterPage