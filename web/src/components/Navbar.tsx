"use client"

import {useSession, signOut} from 'next-auth/react'
import Link from 'next/link'
import {Button} from '@/components/ui/button'

const Navbar = () => {
const {data : session} = useSession()


  return (
    <div>
      
    </div>
  )
}

export default Navbar
