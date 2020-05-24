require('dotenv').config()
const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);
const DataBase=require("better-sqlite3")
const db=new DataBase("../db/guess_the_city_db.db")

var total_answers=0;
var correct_answers=0;

//Shows to the user a new question
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

bot.command("rules",ctx=>{
    let help_message= 
    `Simple guess the city game
type /start to start a new game
you will be asked to answer to 10
questions, when finished you will
get your score`
    ctx.reply(help_message)
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

bot.command("addquestion", ctx =>{
    const stmt_select_admin=db.prepare("SELECT Admin FROM Users WHERE IdUser = ?;") 
    const is_admin = stmt_select_admin.get(String(ctx.chat.id)) //pick a number field, it could be undefined, if it is 0
                                                     //the current user is not an admin, if it is 1 he is an admin

    const stmt_insert_user=db.prepare("INSERT INTO Users (IdUser, UserName, Admin) VALUES ( @ID, @UN, @Adm )")

    const stmt_insert_question=db.prepare("INSERT INTO Questions (LinkPhoto, CorrectAnswer, Answer2, Answer3) VALUES ( @Link, @CorrectAns, @Answer2, @Answer3 )")

    const wrong_input_msg= `please follow this pattern
/addquestion <photo link>|<correct answer>|<answer2>|<answer3>`


    if (is_admin.Admin==0) {
        ctx.reply("You are not an admin you can't insert new questions")
    }

    else if (is_admin.Admin==undefined){
        let user_data={ ID : ctx.chat.id, UN : ctx.chat.username, Adm : 0 }
        const info = stmt_insert_user.run( user_data )
        console.log(`${info.changes} new user`);
        ctx.reply("You are not an admin you can't insert new questions")
    }

    else if (is_admin.Admin==1){
        console.log('is inserting');
        let msg = ctx.message.text
        let input_array= msg.split(" ")

        if (input_array.length!=2) {
            ctx.reply(wrong_input_msg)
            return
        }

        input_array.shift() //remove the command /addquestion
        msg= input_array.join('')
        input_array=msg.split("|")

        if (input_array.length!=4) { //incorrect number of parameters
            ctx.reply(wrong_input_msg)
            return
        }

        if (!(input_array[0].startsWith("https://")||input_array[0].startsWith("www."))) { //check if it is a link
            ctx.reply(`the first parameter is not a link,\n${wrong_input_msg}`)
            return
        }

        if (!(input_array[0].endsWith(".jpg")||input_array[1].endsWith(".jpeg")||input_array[1].endsWith(".png"))) { //check if it is an image
            ctx.reply(`the first parameter is not a supported type of image,\n${wrong_input_msg}`)
            return
        }

        try {
            let new_question_data={ Link : input_array[0], CorrectAns : input_array[1], Answer2 : input_array[2], Answer3 : input_array[3] }
            const info = stmt_insert_question.run( new_question_data )
            console.log(`${info.changes} new question added`);
            ctx.reply("Your question is now registered")

        } catch (e) {
            ctx.reply("Your question could not be registered")
            console.log(e);
        }
    }
})

bot.launch();