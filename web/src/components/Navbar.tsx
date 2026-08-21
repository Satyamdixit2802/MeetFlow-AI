"use client"

import {useSession, signOut} from 'next-auth/react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'

const Navbar = () => {
const {data : session} = useSession()


  return (
    <nav className= "border-b" >

    </nav>
  )
}

export default Navbar
