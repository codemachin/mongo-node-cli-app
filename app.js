var mongoose = require('mongoose');
const readline = require('readline')

var dbPath  = "mongodb://localhost/medi";

// command to connect with database
db = mongoose.connect(dbPath, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});

// inilialise the models
require('./models/userView');
var userModel = mongoose.model('userView')

// declare the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// question 1
const question1 = () => {
  return new Promise((resolve, reject) => {
    let q = `\n\n
Please select:\n
1) Daily
2) Weekly
3) Monthly
4) Yearly
5) Custom
6) Exit\n`
    rl.question(q, (answer) => {
      resolve(answer)
    })
  })
}
// question 2
const question2 = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter custom date (Format: yyyy-mm-dd)\n', (answer) => {
      resolve(answer)
    })
  })
}

// Handle db connection error
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// connect to database and execute the function
mongoose.connection.once('open', function() {
	console.log("database connection open success");
    takeInputAndCalculate()
});

// function to take input and do db operations
async function takeInputAndCalculate() {

    let d = await question1()
    let opt = d.toString().trim();
    let aggregate
    if(opt=='1'){
        aggregate = [
            {
                $group: { 
                    _id: { day: { $dayOfMonth: "$ViewDate" }},views: { $sum: 1 },uniqueValues: {$addToSet: "$UserId"}
                }
            },
            {
            $project:{
                    _id: 0,
                    day: "$_id.day",
                    views: 1,
                    uniqueViews:{$size:"$uniqueValues"}
                }
            }
        ]
        
    }else if(opt=='2'){
        aggregate = [
            {
                $group: { 
                    _id: { week: { $week : "$ViewDate" }},views: { $sum: 1 },uniqueValues: {$addToSet: "$UserId"}
                }
            },
            {
            $project:{
                    _id: 0,
                    week: "$_id.week",
                    views: 1,
                    uniqueViews:{$size:"$uniqueValues"}
                }
            }

        ]

    }else if(opt=='3'){
        aggregate = [
            {
                $group: { 
                    _id: { month: { $month : "$ViewDate" }},views: { $sum: 1 },uniqueValues: {$addToSet: "$UserId"}
                }
            },
            {
            $project:{
                    _id: 0,
                    month: "$_id.month",
                    views: 1,
                    uniqueViews:{$size:"$uniqueValues"}
                }
            }

        ]

    }else if(opt=='4'){
        aggregate = [
            {
                $group: { 
                    _id: { year: { $year : "$ViewDate" }},views: { $sum: 1 },uniqueValues: {$addToSet: "$UserId"}
                }
            },
            {
            $project:{
                    _id: 0,
                    year: "$_id.year",
                    views: 1,
                    uniqueViews:{$size:"$uniqueValues"}
                }
            }
        ]

    }else if(opt=='5'){
        let input2 = await question2()
        let date = input2.toString().trim();
        aggregate = [
            {"$match":{"ViewDate":{
                "$gte": new Date(date+"T00:00:00.000Z"),
                "$lte": new Date(date+"T23:59:59.999Z")
            }}},
            {
                $group: { 
                    _id: { day: { $dayOfMonth: "$ViewDate" }},views: { $sum: 1 },uniqueValues: {$addToSet: "$UserId"}
                }
            },
            {
                $project:{
                    _id: 0,
                    day: "$_id.day",
                    views: 1,
                    uniqueViews:{$size:"$uniqueValues"}
                }
            }

        ]
        

    }else if(opt=='6'){
        console.log("Bye Bye")
        process.exit(0);
    }else{
        console.log('invalid option')
        takeInputAndCalculate()
    }

    if(opt){
        userModel.aggregate(aggregate,(err,foundUser)=>{
            if(err){
                console.log(err)
                process.exit(1);
            }
            console.log(foundUser)
            takeInputAndCalculate()
        })
    }else{
        console.log('No option selected')
        takeInputAndCalculate()
    }

}