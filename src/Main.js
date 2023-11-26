require('dotenv').config();
const CharacterAI = require("node_characterai");
const fs = require('fs');
const fetch = require('node-fetch');
const {Client, IntentsBitField, MessageFlags, Utils, VoiceChannel} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, getVoiceConnections, getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus} = require('@discordjs/voice');
const { privateDecrypt } = require('crypto');
const { setChatChannel, getChatChannel, getCharacter, setCharacter, getCharacterID } = require('./ServerDataHandler');
const puppeteer = require("puppeteer");
const { join } = require('path');
const FormData = require('form-data');
const { error } = require('console');
const VoiceHandler = require('./VoiceHandler.js');

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

  const voiceChannel = discordClient.channels.cache.get("1107763048158077040");

  var audioPlayer = createAudioPlayer();

          var connection = await joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: voiceChannel.guild.id,
              adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          }).subscribe(audioPlayer);

  const voicehandler = await new VoiceHandler(discordClient, connection.connection, characterAI);
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
});


discordClient.login(process.env.DISCORD_BOT_TOKEN);


