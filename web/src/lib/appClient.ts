import axios from 'axios'
import {getSession} from 'next-auth/react'

const appClient = axios.create({
    baseURL : "/",
    headers : {"Content-Type": "application/json"},

})

appClient.interceptors.request.use(async (config) => {
    const session = await getSession()
    if(session) {
        config.headers["x-user-id"] = session.user.id
    }
    return config
})

export default appClient