require('dotenv').config()
const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);
const DataBase=require("better-sqlite3")
const db=new DataBase("../db/guess_the_city_db.db")

var total_answers=0;
var correct_answers=0;

function newQuestion (ctx){
    const stmt_select=db.prepare("SELECT * FROM Questions ORDER BY RANDOM() LIMIT 1;") //pick a random row from the db
    const data= stmt_select.get() //puts the JSON from the query into the variable data
    let print_array=[
                     { text: data.CorrectAnswer, callback_data:"correct" }, 
                     { text: data.Answer2, callback_data: "wrong" },
                     { text: data.Answer3, callback_data: "wrong"}
                    ]
    print_array.sort(function (a, b) { return 0.5 - Math.random() }) //shuffle the array of answers
    bot.telegram.sendPhoto(ctx.chat.id, data.LinkPhoto, {
        reply_markup: {
            inline_keyboard:[
                print_array
            ]
        },
        disable_notification : true
    })

}

bot.start( ctx =>{
    total_answers=0;
    correct_answers=0;
    newQuestion(ctx)
})


bot.action("correct", ctx =>{
    total_answers++
    correct_answers++
    ctx.deleteMessage()
    ctx.answerCbQuery("CORRECT ANSWER!")
    if (total_answers <10) {
        newQuestion(ctx)        
    }else{
        bot.telegram.sendMessage(ctx.chat.id,`You answered to all the 10 questions\nand made ${correct_answers} correct answers on ${total_answers}\ntype /start to start a new game`)
    }
})

bot.action("wrong", ctx =>{
    total_answers++
    ctx.deleteMessage()
    ctx.answerCbQuery("WRONG ANSWER")
    if (total_answers <10) {
        newQuestion(ctx)        
    }else{
        bot.telegram.sendMessage(ctx.chat.id,`You answered to all the 10 questions\nand made ${correct_answers} correct answers on ${total_answers}\ntype /start to start a new game`)
    }
})



bot.command("total", ctx=>{
    ctx.reply(`${correct_answers} correct answers on ${total_answers}`)
})

bot.launch();