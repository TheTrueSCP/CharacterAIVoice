const puppeteer = require("puppeteer");
const { join } = require('path');
const FormData = require('form-data');
const { error } = require('console');
require('dotenv').config();
const CharacterAI = require("node_characterai");
const fs = require('fs');
const fetch = require('node-fetch');
const {Client, IntentsBitField, MessageFlags, Utils, ConnectionService} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, EndBehaviorType, StreamType, getVoiceConnections, getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus} = require('@discordjs/voice');
const { privateDecrypt } = require('crypto');
const { OpusEncoder } = require('@discordjs/opus');
var wav = require('wav');
const { Stream } = require("stream");
const { SpeechToText, GenerateResponse, GenerateVoice, GenerateVoiceDefault } = require("./Implementations");
const { connect } = require("http2");
const { WriteMapToJson, getCharacterGenerateLock, setCharacterGenerateLock } = require("./ServerDataHandler");

class VoiceHandler
{
    constructor(Client, connection, characterAI)
     {
        this.audioPlayer = createAudioPlayer();
        connection.subscribe(this.audioPlayer);
        this.receiver = connection.receiver; // <- Audio receiver.
        this.speakers = new Set(); // <- Currently listened-to people.
        this.characterAI = characterAI;
        this.subscription = null;
    
        // Remove listeners to use the custom function.
        this.receiver.speaking.removeAllListeners();
    
        // When a user is detected.
        this.receiver.speaking.on("start", userId => { this.#listen(Client, userId) });
      }

      async #listen(Client, userId) 
      {

        // Classes and functions to use.
        const { DatabaseManager } = Client;
        // Subscription between the bot and the user.
        const subscription = this.receiver.subscribe(userId, 
            {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 100
          }
        });

        this.subscription = subscription;
    
        const encoder = new OpusEncoder(48000, 2);
        const buffer = [];
    
        subscription.on("data", chunk => { buffer.push( encoder.decode( chunk ) ) }); 
        
        subscription.once("end", async () =>
        { 
            var outputDir = join(process.env.TEMP_PATH, "voices");

            var outputPath = join(outputDir, `${userId}.wav`);

            const FileWriter = require('wav').FileWriter
            
            let audioStream = await bufferToStream(Buffer.concat(buffer));

            if(!fs.existsSync(outputDir))
            {
                fs.mkdirSync(outputDir, {recursive: true});
            }

            var outputFileStream = new FileWriter(outputPath, 
            {
                                        sampleRate: 48000,
                                      channels: 2
            });

         var stream = audioStream.pipe(outputFileStream);

         stream.on('finish', async() => 
         {
            await this.handleUserHasSpoken(outputPath);
         });
        }); 
      }

      async handleUserHasSpoken(spokenTextPath)
      {
        const characterAIID = "tYumSvjaKy2rAFBSusTBqb8HOiXPuqiiSun0DYckuEg";
        const elevenLabCharacterID = "t72Wefb41W5sJgEisdlv";

        if(!getCharacterGenerateLock(characterAIID))
        {
          setCharacterGenerateLock(characterAIID, true);

          var debugData = [];

          debugData.push(getCurrentTimestamp());

          var spokenText = await SpeechToText(spokenTextPath);
          console.log("speech to text");
          console.log(spokenText);

          debugData.push(getCurrentTimestamp());

          var response = await GenerateResponse(this.characterAI, characterAIID, spokenText, true);
          console.log("response");
          
          console.log(response);
          debugData.push(getCurrentTimestamp());

          var responseAudio = await GenerateVoice(response.text, elevenLabCharacterID, "eleven_turbo_v2",4, 0.65, 0.90, 0, false);

          console.log("voice");
          debugData.push(getCurrentTimestamp());

          this.audioPlayer.play(await createAudioResource(responseAudio));

          setCharacterGenerateLock(characterAIID, false);
          //Debug
          var debugDataTemp = [...debugData];

          for(var i = 1; i < debugData.length; i++)
          {
            debugData[i] = debugDataTemp[i] - debugDataTemp[i - 1];
          }

          debugData[0] = 0;

          console.log(debugData);
        }
      }

      async removeData() 
      {
        if(this.subscription != null)
        {
            this.subscription.removeAllListeners();
        }
        
        this.receiver.speaking.removeAllListeners();
      }
}

function bufferToStream(binary) 
{
    const readableInstanceStream = new Stream.Readable({
        read() {
            this.push(binary);
            this.push(null);
        }
    });
    return readableInstanceStream;
}

function getCurrentTimestamp () {
    return Date.now() / 1000;
  }
  
module.exports = VoiceHandler;