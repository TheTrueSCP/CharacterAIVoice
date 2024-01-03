So yeah, this a VERY basic interface between discord and character AI and more like a concept than a real mechanic. I was able to get the response time to under 5 seconds, which is still a little bit high, but yeah, will work for now. 


It works with a few APIs:

1. Character AI - AI itself - free
2. Node(Javascript) - the giganitc logic behind it - free
   
3. Elevenlabs - the voice cloning AI - not free
4. OpenAI Whipser - voice to text - not free

Note:
Im currently trying to remove the paid stuff and with the new Character Ai vocie cloning feature(currently only ca.plus subscriber accessable) Elevenlabs will removed at some point. 
And about Speech to text: Im SURE there is a free API for this, i havent found it yet.


If you have any ideas or even want to work on this, do not hesistate to write me here or on Discord (username: thetruescp).


How the system works:

When the discord client is initiated, its creates a VoiceHandler which listens to a specific voicechannel (passed in the constructor). 
1. If someone speaks, it will record this voice until the person stops speaking.
2. The voice will be sent to the Speech To Text API (OpenAi Whisper) and the final text is returned
3. The text will be sent to character AI and it will returns the response.
4. This response will be sent to Elevenlabs which will create a voice out of it. (In Elevenlabs you can create a custom voice which sounds VERY good if its good trained)
5. This audio will then played by the discord bot.

Meanwhile a cycle is running, no other responses can be recorded.

So, if you really want to set this up, well here are the steps:

1. clone this repo/download it 
2. init node v19.9.0 
3. install all packages with "npm install"
4. Create a file in the root of the project called ".env"
5. Copy the content of ".env-default" into the new ".env" file and fill them with your tokens (for further explanation scroll down)
6. Let the discord bot join your server
7. Copy the voicechannel id with right-click -> copy id and paste it at Main.js-line 36 under "CHANNELID"
8. To set the AI and the voice you want to use for the AI, you can paste their regarding AIs under VoiceHandler.js-90 and 91
9. Run everything with "npx nodemon" or "npm nodemon" and pray that it will run
10. Join the bot in the set voicechannel
11. Start speaking, if he responds, yay, it worked, gratulations


Token Explanation:
DISCORD_BOT_TOKEN -> The token of your discord bot which will be given to you of you create a discord application(bot), ALSO DONT FORGET TO ENABLE ALL INTENTS
DISCORD_BOT_CLIENT_ID -> The public client id, also called "Application ID" which can be found in your discord bot-dev site under "General Information -> Application ID"
CHARACTER_AI_CLIENT_TOKEN -> The hardest one to get, see https://github.com/realcoloride/node_characterai?tab=readme-ov-file#using-an-access-token
ELEVENLABS_API_KEY -> When you logged into your elevenlabs account, you can get this under: Profile -> API-Key
OPENAI_SPEECH_TO_TEXT_API_KEY -> If you are logged in, under API-Keys, you need to create a new one and copy it

How to get CharacterAI Character Id: Open the Ai-chat, open the URL and copy everything from the "char=" to the "&"
Example: https://plus.character.ai/chat?char=uoXbcxeSOqavDBZdD_yYaz6x4tOqCeAqikvTLfvVCg8&source=recent-chats -> uoXbcxeSOqavDBZdD_yYaz6x4tOqCeAqikvTLfvVCg8

How to get Elevenlab ID:just click the ID button when you have found or created your voice


So, you see, its FUCKING Complicated to make this running, and of course you will run into a few issues, so 
if you still want to try and run this, im here to get it running on your side, so just ask me Discord (username: thetruescp) if you need help with anything :)

