import {withAuth} from 'next-auth/middleware'
import {NextResponse} from 'next/server'

export default withAuth(
    function middleware(request){
        return NextResponse.next();
    },
    {
        callbacks : {
            authorized : ({token}) => !!token ,
        },
    }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meetings/:path*",
    "/analytics/:path*",
    "/profile/:path*",
  ],
}