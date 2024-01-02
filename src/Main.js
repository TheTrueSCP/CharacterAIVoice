require('dotenv').config();
const CharacterAI = require("node_characterai");
const fs = require('fs');
const fetch = require('node-fetch');
const {Client, IntentsBitField, MessageFlags, Utils, VoiceChannel} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, getVoiceConnections, getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus} = require('@discordjs/voice');
const { privateDecrypt } = require('crypto');
const puppeteer = require("puppeteer");
const { join } = require('path');
const FormData = require('form-data');
const { error } = require('console');
const VoiceHandler = require('./VoiceHandler.js');
const { SpeechToText, GenerateResponse, GenerateVoice, GenerateVoiceDefault } = require("./Implementations");

const { WriteMapToJson, getCharacterGenerateLock, setCharacterGenerateLock } = require("./ServerDataHandler");

const discordClient = new Client({

    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],
});

const characterAI = new CharacterAI();

discordClient.on('ready', async(c) => 
{
  await characterAI.authenticateWithToken(process.env.CHARACTER_AI_CLIENT_TOKEN);

  console.log(`${c.user.tag} online`);

  /*const voiceChannel = discordClient.channels.cache.get("845038537203515416");

  var audioPlayer = createAudioPlayer();

          var connection = await joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: voiceChannel.guild.id,
              adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          }).subscribe(audioPlayer);
*/
  //const voicehandler = await new VoiceHandler(discordClient, connection.connection, characterAI);
});

discordClient.on('interactionCreate', async interaction => 
{
  var channelID = interaction.channel.id;
  var serverID = interaction.guild.id;
  var command = interaction.commandName;

  
});

discordClient.on("messageCreate", async message => 
{
  const serverID = message.guild.id;
  const channelID = message.channelId;

  if(message.member.user.id == discordClient.user.id)
  {
      return;
  }


  if(!characterAI.isAuthenticated())
  {
    return;
  }

  var audioPlayer = createAudioPlayer();

  const voiceChannel = discordClient.channels.cache.get("845038537203515416");

  var connection = await joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  }).subscribe(audioPlayer);


  const characterAIID = "tYumSvjaKy2rAFBSusTBqb8HOiXPuqiiSun0DYckuEg";
  const elevenLabCharacterID = "t72Wefb41W5sJgEisdlv";

  if(!getCharacterGenerateLock(characterAIID))
  {
    setCharacterGenerateLock(characterAIID, true);

    var debugData = [];

    debugData.push(getCurrentTimestamp());

    var response = await GenerateResponse(characterAI, characterAIID, message.content, true);
    console.log("response");
    
    console.log(response);
      

    debugData.push(getCurrentTimestamp());
    //Uzi -> stability:0.65, similarity boost: 0.90 
    var responseAudio = await GenerateVoice(response.text, elevenLabCharacterID, "eleven_turbo_v2",4, 0.61, 1, 0, false);

    console.log("voice");
    debugData.push(getCurrentTimestamp());

    audioPlayer.play(await createAudioResource(responseAudio));


    await message.reply(response.text);

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
});


discordClient.login(process.env.DISCORD_BOT_TOKEN);

function getCurrentTimestamp () {
  return Date.now() / 1000;
}

