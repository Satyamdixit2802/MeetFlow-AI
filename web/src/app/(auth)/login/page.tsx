"use client"

import {useState} from "react";
import {signIn} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import Link from 'next/link'
import { toast } from "@/components/ui/toast"
import {MicAudioLines} from 'lucide-react'
import Image from 'next/image'
import { error } from "next/dist/build/output/log";
import { Fascinate } from "next/font/google";


 function  LoginPage() {
    const router = useRouter() ;
    const [formData,setFormData] =  useState({
       email: "",
      password: "",
    })
    const [loading, setLoading] = useState(false)

    async function handleCredentials() {
      

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
      const res = await signIn("credentials", {
         email : formData.email,
         password : formData.password,
         redirect : false,
      })
       
      if(res?.error){
         toast.add({
            type : "error",
            title : res?.error 
         })
         setLoading(false)
         return
      }
      router.push("/dashboard")



    }

    async function handleGoogle(){
       await signIn("google",{callbackUrl : "/dashboard"})
    }
    function handleChange(e) {
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
         <h1 className="text-3xl font-bold ">Sign in</h1>
         <p className="text-lg font-medium tracking-tighter">to your MeetingAI Account</p>
         </div>
         <Button className= "w-full " variant="outline" size={'lg'} onClick={handleGoogle}>
            <Image src="./google.svg" alt="google svg" height={20} width={20}/>
            Continue with Google
         </Button>
          <div className="flex items-center gap-4 w-full my-2">
  <div className="h-px flex-1 bg-gray-600" />
  
  <span className="text-sm text-gray-500">OR</span>
  
  <div className="h-px flex-1 bg-gray-600" />
</div>

      <form className="space-y-4 w-full max-w-md " >
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
             onKeyDown={(e) => e.key === "Enter" && handleCredentials()}
            className="w-full  px-5 py-2 text-md rounded-lg  bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"/>
         </div>
         <Button className="w-full text-lg mt-8 font-medium tracking-tight bg-gray-400 py-5 px-4"
         onClick={handleCredentials} 
         disabled ={loading}> {loading ? "Signing in..." : "Sign in"}</Button>
        
      </form>
        <p className="text-center ">No account?{" "}
            <Link href="/register" className="underline">Register</Link>
        </p>
      </div>


    );
}

export default  LoginPage