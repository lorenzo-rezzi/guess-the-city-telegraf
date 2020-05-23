require('dotenv').config()
const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

var total_answers=0;
var correct_answers=0;

function newQuestion (ctx){
    bot.telegram.sendPhoto(ctx.chat.id, "https://cdn.getyourguide.com/img/location_img-3912-1116427648-148.jpg", {
        reply_markup: {
            inline_keyboard:[
                [ 
                    { text: "Hollywood", callback_data:"correct" }, 
                    { text: "London", callback_data: "wrong" },
                    { text: "NewYork", callback_data: "wrong"}
                ]
            ]
        }
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
    ctx.answerCbQuery()
    if (total_answers <=10) {
        newQuestion(ctx)        
    }else{
        bot.telegram.sendMessage(ctx.chat.id,`You answered to all the 10 questions\nand made ${correct_answers} correct answers on ${total_answers}\ntype /start to start a new game`)
    }
})

bot.action("wrong", ctx =>{
    total_answers++
    ctx.deleteMessage()
    ctx.answerCbQuery()
    if (total_answers <=10) {
        newQuestion(ctx)        
    }else{
        bot.telegram.sendMessage(ctx.chat.id,`You answered to all the 10 questions\nand made ${correct_answers} correct answers on ${total_answers}\ntype /start to start a new game`)
    }
})



bot.command("total", ctx=>{
    ctx.reply(`${correct_answers} correct answers on ${total_answers}`)
})

bot.launch();