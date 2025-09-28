import dotenv from "dotenv"
import pkg from "cloudinary"
const {v2: cloudinary} = pkg
dotenv.config()

cloudinary.config({
	cloud_name:process.env.CLOUDNAME,
	api_key:process.env.CLOUDKEY,
	api_secret:process.env.CLOUDSECRET
})


export default cloudinary



