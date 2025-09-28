import mongoose from 'mongoose'

const Db=()=>{
	try{
		mongoose.connect(process.env.mongo_url)
		console.log("connected to database")

	}catch(e){
		console.log("DB connection failed", e.message)
		process.exit(1)
	}
}


export default Db