import {
fetchchats,
creategroupchat,
renamegroup,
Addtogroup,
removefromgroup,create,
Fetchgroups,accessGroups} from "../Controllers/Chat.js"
import Userauth from '../Middleware/Userauth.js'

import express from "express"


const ChatRouter=express.Router()

ChatRouter.post('/renamegrp',Userauth,renamegroup)
ChatRouter.get('/fetchchat',Userauth,fetchchats)
ChatRouter.get('/fetchgroups',Userauth,Fetchgroups)
ChatRouter.post('/creategrp',Userauth,creategroupchat)
ChatRouter.post("/addtogrp",Userauth,Addtogroup)
ChatRouter.post('/remove',Userauth,removefromgroup)
ChatRouter.post('/create',Userauth,create)
ChatRouter.post('/accessGroups',Userauth,accessGroups )

export default ChatRouter