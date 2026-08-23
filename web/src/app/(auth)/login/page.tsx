"use client"

import {useState} from "react";
import {signIn} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {Button} from '@/components/ui/button'
import Link from 'next/link'
import {Card,CardContent,CardTitle,CardHeader} from '@/components/ui/card'
import { toast } from "@/components/ui/toast"
import {MicAudioLines} from 'lucide-react'
import Image from 'next/image'


 function  LoginPage() {
    const router = useRouter() ;
    const[ email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleGoogle(){
       await signIn("google",{callbackUrl : "/dashboard"})
    }

    return (
      <div >

      </div>

    );
}

export default  LoginPage