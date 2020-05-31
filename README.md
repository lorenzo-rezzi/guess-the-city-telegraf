# guess-the-city-telegraf
school project

The bot shows an image of a random city with 3 possible answers under it, they are taken from the database (sqlite) 
The Questions DB has this structure:
IdQuestion🔑(INTEGER) | LinkPhoto(TEXT) | CorrectAnswer(TEXT) | Answer2(TEXT) | Answer3(TEXT)

Query used to create it:
CREATE TABLE "Questions" (
	"IdQuestion"	INTEGER,
	"LinkPhoto"	TEXT NOT NULL UNIQUE,
	"CorrectAnswer"	TEXT NOT NULL UNIQUE,
	"Answer2"	TEXT NOT NULL,
	"Answer3"	TEXT NOT NULL,
	PRIMARY KEY("IdQuestion")
);

Then when the user answers to that question it increments his score
When the user answered to all the 10 questions the bot sends his score

Admin: 
An admin can insert a new question, the image field must be a link to a jpeg or png image
The Users DB has this structure
IdUsers🔑(TEXT) | UserName(TEXT) | Admin(INTEGER)

IdUsers is the chatid of the bot
Username is the telegram username
Admin is an integer field, 1 stands for admin, 0 is a common user

Query used to create it:
CREATE TABLE "Users" (
	"IdUser"	INTEGER,
	"UserName"	TEXT NOT NULL,
	"Admin"	INTEGER NOT NULL,
	PRIMARY KEY("IdUser")
);
