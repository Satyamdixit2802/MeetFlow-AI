import {NextResponse, NextRequest} from "next/server"
import bcrypt from "bcryptjs"
import User from "@/models/User.model"
import dbConnect from "@/lib/db"
import { error } from "next/dist/build/output/log";

async function POST(request : NextRequest){
    try {
        await dbConnect();

        const {name, email, password} = request.json();

        if(!email || !password){
            return NextResponse.json(
                {error : "Email and password are required"},
                {status : 400}
            )
        }
        if(password.length < 6){
            return NextResponse.json({
                error : "password must be atleast 6 characters"
            })
        }
       
        const existingUser = await User.findOne({email})

        if(existingUser){
            return NextResponse.json(
                {error : "An account with this email already exists"},
                {status : 409}
            )
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            email,
            password: hashedPassword,
            name : name ?? ""
        })
       
       return NextResponse.json(
        {id : user._id, email: user.email},
        {status : 201}
       )

    }catch(error){
        console.error("[POST /api/auth/register]", error)
        return NextResponse.json({
            error : "Registration failed"
        },
    {status : 500})
        
    }
}