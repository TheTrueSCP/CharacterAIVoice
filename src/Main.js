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

  const voiceChannel = discordClient.channels.cache.get("845038537203515416");

  var audioPlayer = createAudioPlayer();

          var connection = await joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: voiceChannel.guild.id,
              adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          }).subscribe(audioPlayer);

  const voicehandler = await new VoiceHandler(discordClient, connection.connection, characterAI);
});


discordClient.login(process.env.DISCORD_BOT_TOKEN);


