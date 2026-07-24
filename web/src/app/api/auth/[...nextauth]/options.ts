import  {NextAuthOptions} from 'next-auth'
import CredentialProviders from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from 'bcryptjs'
import User from '@/models/User.model'
import dbConnect from '@/lib/db'
import Email from 'next-auth/providers/email';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.CLIENT_ID ?? '',
            clientSecret: process.env.CLIENT_SECRET ?? '',
        }),

        CredentialProviders({
            name : "credentials",
            credentials : {
                email : {label : "Email", type : "email"},
                password : {label : "Password", type : "password"},
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password ) {
                    throw new Error ("Email and password are required")
                }
                await dbConnect();

                const user = await User.findOne({email : credentials.email});

                if(!user || !user.password){
                    throw new Error("Either the email or password is wrong ")
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if(!isValid){
                    throw new Error("Either the email or password is wrong ")
                }

                return {
                    id : user._id.toString(),
                    email : user.email,
                    name : user.name ?? '',
                    image : user.image ?? ''
                };
            }
        })
    ],

    callbacks : {
        async jwt({token,user,account}){
           
            if(user){
                token.id = user.id;
            }

            if(account?.provider === "google" && token.email){
                await dbConnect();

                const existingUser = await User.findOne({email : token.email})
                if(!existingUser){
                    const newUser = await User.create({
                      email : token.email,
                      name: token.name ?? '',
                      image : token.picture ?? "",

                    })
                    token.id = newUser._id.toString();

                }else {
                    token.id = existingUser._id.toString();
                }
            }
            return token;
        },
        async session({session,token}){
            if (session.user){
                session.user.id = token.id as string
            }
            return session
        },
     },
     
     pages : {
        signIn : "/login",
        error : "/login"
     },
     session : {
        strategy : "jwt",
        maxAge : 7 * 24 * 60 * 60 ,
     },
     secret : process.env.NEXTAUTH_SECRET,

};