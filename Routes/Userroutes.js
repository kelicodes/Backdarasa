import express from "express"
import {userRegistration,Login,Logout,Fetchusers,userRegistration202} from "../Controllers/User.js"
import upload from "../Middleware/Multer.js"


const UserRouter= express.Router()

UserRouter.post("/signup",upload.fields([
	{name:"profileimage",maxCount:1}
]), userRegistration202)


UserRouter.post("/login",Login)
UserRouter.post("/logout",Logout)
UserRouter.get('/allusers',Fetchusers)

export default UserRouter