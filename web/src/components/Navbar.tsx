"use client"

import {useSession, signOut} from 'next-auth/react'
import Link from 'next/link'
import { Button, buttonVariants } from "@/components/ui/button"
import {MicAudioLines} from 'lucide-react'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
const {data : session} = useSession()
    const { setTheme } = useTheme()


  return (
    <nav className= "border-b border-border bg-background/95 backdrop-blur-2xl sticky top-0 z-50 shadow-2xl  " >
      <div className="w-6xl mx-auto px-4 h-18 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl trackin-tight flex items-center justify-center gap-2">
              <MicAudioLines size ={30} />️ MeetingAI
          </Link>
         <div className={"flex items-center justify-between "}>
             <div className="flex items-center gap-5">
                 {
                     session ?
                         <>
                             <Link href='/dashboard'
                                   className = "text-lg text-muted-foreground hover:text-foreground transition-colors">
                                 Dashboard
                             </Link>
                             <Link href='/analystics'
                                   className = "text-lg text-muted-foreground hover:text-foreground transition-colors">
                                 Analytics
                             </Link>
                             <div className="flex items-center gap-3">
                                 {
                                     session.user?.image && (
                                         <Image src={session.user.image} alt="avatar" className = " w-7 h-7 rounded-full"    />
                                     )
                                 }
                                 <span className="text-lg text-muted-foreground">
                                     {session.user?.name ?? session.user?.email}
                                 </span>
                             </div>
                             <Button size = "lg"
                             onClick={()=> {signOut({callbackUrl: "/login"})}}>Sign out</Button>
                         </>
                         :(<Link href="/login" className="">
                             <Button className=" active:scale-95">Sign in </Button>
                         </Link>)
                 }
             </div>
             <div className={'ml-8'}>
                 <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ size: "lg" })}>
                              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                              <span className="sr-only">Toggle theme</span>
                      </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => setTheme("light")}>
                             Light
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setTheme("dark")}>
                             Dark
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setTheme("system")}>
                             System
                         </DropdownMenuItem>
                     </DropdownMenuContent>
                 </DropdownMenu>
             </div>
         </div>

      </div>

    </nav>
  )
}

export default Navbar
