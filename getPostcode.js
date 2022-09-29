var express = require("express")
const mongo = require('mongodb');
const axios = require('axios').default;
var url = "mongodb://localhost:27017/mydb";
var app = express()
let db
let client
(async ()=>{
client = await mongo.MongoClient.connect(url);
db=client.db("mydb")

})()
app.get("/postcode",async (req,res)=>{
    let lat=req.query.lat
    let lon=req.query.lon
    console.log(lat)
    console.log(lon)
    let doc=await db.collection("UK-latest1").find({"latitude":lat,"longitude":lon},{}).toArray()
    //console.log(doc)
    if(doc.length>0){
    res.send({'status':200,'data':doc})
    }
    else{
        const URL=`https://findthatpostcode.uk/points/${lat},${lon}.json`
        await axios.get(URL).then(async function(response){
            myobj={latitude:lat,longitude:lon,included:response.data.included[0]}
              //console.log(response.data.included[0])
         await db.collection("UK-latest1").insertOne(myobj)
         console.log("inserted")
         res.statusCode=400
         res.send({'status':400,'message':"Lat long not found in DB but inserted the data based on 3rd party API"})
         
        })
        .catch(async (error) => {
            console.log(error)
             // await wait(60000);
         });
    }
    
})
app.listen(3000,function(){
    console.log("server is running at port 3000")
  });