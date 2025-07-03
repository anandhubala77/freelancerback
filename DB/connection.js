const mongoose=require('mongoose')

const connectioString=process.env.DATABASE_URL


//connect mongodb

mongoose.connect(connectioString).then((res)=>{
    console.log("mongodbconnected successsfully");
    
}).catch((err)=>{
    console.log(err);
    
})