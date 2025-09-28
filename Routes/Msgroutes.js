import express from "express"
import {sendmsg, allmsg} from "../Controllers/Messages.js"
import Userauth from '../Middleware/Userauth.js'


const MsgRouter=express.Router()

MsgRouter.get("/allmsg/:chatId",Userauth,allmsg)
MsgRouter.post("/sendmsg",Userauth,sendmsg)


export default MsgRouter