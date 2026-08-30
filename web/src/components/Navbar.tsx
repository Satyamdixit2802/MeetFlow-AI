"use client"

import {useSession, signOut} from 'next-auth/react'
import Link from 'next/link'
import { Button} from "@/components/ui/button"
import {MicAudioLines} from 'lucide-react'

import Image from "next/image"


const Navbar = () => {
const {data : session} = useSession()
   


  return (
    <nav className= "  bg-gray-300/95 backdrop-blur-2xl sticky top-0 z-50 shadow-md shadow-gray-600  " >
      <div className="w-6xl mx-auto px-4 h-20 flex items-center justify-between ">
          <Link href="/" className="font-bold text-2xl tracking-tight flex items-center justify-center gap-2">
              <MicAudioLines size ={30} />️ MeetingAI
          </Link>
         <div className={"flex items-center justify-between relative"}>
             <div className="flex items-center gap-5">
                 {
                     session ?
                         <>
                             <Link href='/dashboard'
                                   className = "text-md text-muted-foreground hover:text-foreground transition-colors">
                                 Dashboard
                             </Link>
                             <Link href='/analytics'
                                   className = "text-md text-muted-foreground hover:text-foreground transition-colors">
                                 Analytics
                             </Link>
                             <div className="flex items-center gap-3">
                                 
                                 <span className="text-md text-muted-foreground">
                                     {session.user?.name ?? session.user?.email}
                                 </span>
                                 {
                                     session.user?.image && (
                                         <Image src={session.user.image} alt="avatar" className = "rounded-4xl" width={40} height={40}    />
                                     )
                                 }
                             </div>
                             <Button size = "lg"
                             onClick={()=> {signOut({callbackUrl: "/login"})}}>Sign out</Button>
                         </>
                         :(<Link href="/login" >
                             <Button size="lg" className=" active:scale-95 text-lg font-md">Sign in </Button>
                         </Link>)
                 }
             </div>
             
         </div>

      </div>

    </nav>
  )
}

export default Navbar
