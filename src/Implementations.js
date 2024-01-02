const puppeteer = require("puppeteer");
const { join } = require('path');
const FormData = require('form-data');
const { error } = require('console');
require('dotenv').config();
const CharacterAI = require("node_characterai");
const fs = require('fs');
const fetch = require('node-fetch');
const {Client, IntentsBitField, MessageFlags, Utils} = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, getVoiceConnections, getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus} = require('@discordjs/voice');
const { privateDecrypt } = require('crypto');

//CharacterAI
/**
 * CharacterAI
 * @param {String} characterID CharacterAI character id
 * @param {Boolean} singleReply Should the AI reply with only one reply or with more
 * @returns {String} the respones or empty string when failed
 */
async function GenerateResponse(characterAI, characterID, message, singleReply)
{
  try
  {
  if(!characterAI.isAuthenticated())
  {
    throw new Error("Character AI is not authenticated!");
  }
  
  const chat = await characterAI.createOrContinueChat(characterID);

  // Send a message
  return await chat.sendAndAwaitResponse(message, singleReply);
}
catch(err)
{
  console.log(err);
  return "";
}

}

//OpenAI Whisper


/**
 * Uses OpenAI Whisper
 * @param {String} speechFilePath The path where with the speech on it
 * @returns {String} the spoken words
 */
async function SpeechToText(speechFilePath)
{
  try
  { 
    if(!fs.existsSync(speechFilePath))
    {
      throw new Error("the file does not exist!");
    }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(speechFilePath));
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'text');
  
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_SPEECH_TO_TEXT_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      };

    const speechOutput = await fetch('https://api.openai.com/v1/audio/transcriptions', options);     


    const textDecoder = new TextDecoder();

    var buffer = await speechOutput.arrayBuffer();

    await fs.unlinkSync(speechFilePath);

   return await textDecoder.decode(buffer);
  }
  catch(err)
  {
    console.log(err);

    return "";
  }
}



//Elevenlabs

async function GenerateVoiceDefault(text, characterID, stability, similarityBoost)
{
  return GenerateVoiceAdvanced(text, characterID, "eleven_turbo_v2", stability, similarityBoost);
}


async function GenerateVoiceAdvanced(text, characterID, characterModel, stability, similarityBoost)
{
  return GenerateVoice(text, characterID, characterModel, 0, stability, similarityBoost, 0, true);
}

/**
 * 
 * @param {String} text The text which should be spoken by the AI
 * @param {String} characterID The voice AI's ID
 * @param {String} modelID The voice model()
 * @param {Int} latency how fast it should generate on costs on the quality 0 = (no latency optimizations)  1 = normal latency optimizations (about 50% of possible latency improvement of option 3)  2 = strong latency optimizations (about 75% of possible latency improvement of option 3)  3 = max latency optimizations  4 = max latency optimizations + text normalizer turned off, can mispronounce eg numbers and dates)
 * @param {Float} stability voice stability -> 0(More variable) <-> 1(More stable)
 * @param {Float} similarityBoost controls the clarity -> 0(fewer/no artifacts in background) <=> 1(more clarity and better speaker quality/similarity)
 * @param {Float} style should more exxagerate 0(fastest and disabled) <=> 1(exaggerated, more time needed)
 * @param {boolean} speakerBoost imrproves the similarity even more on costs of some time
 * @returns the path to the generated sound.mp3
 */
async function GenerateVoice(text, characterID, modelID, latency, stability, similarityBoost, style, speakerBoost)
{
  try
  { 
    const options = {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
      {
        "model_id": modelID,
        "text": text,"voice_settings":{"similarity_boost":similarityBoost, "stability": stability, "style": style, "use_speaker_boost": speakerBoost}
      }),
    };

    const audioData = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${characterID}?optimize_streaming_latency=${latency}&output_format=mp3_44100_32`, options);

    var arrayBuffer = await await audioData.arrayBuffer();


    const fileOutputPath = join(process.env.TEMP_PATH, "audio");
    const fileOutput = join(fileOutputPath,`${characterID}.mp3`);

    if(!fs.existsSync(fileOutputPath))
    {
      await fs.mkdirSync(fileOutputPath, {recursive: true});
    }

    if(fs.existsSync(fileOutput))
    {
     await fs.unlinkSync(fileOutput);
    }
    fs.writeFileSync(fileOutput, await Buffer.from(arrayBuffer));


    return fileOutput;
  }
  catch(err)
  {
    console.log(err);

    return null;
  }
}

module.exports = {GenerateVoice, GenerateResponse, GenerateVoiceAdvanced, GenerateVoiceDefault, SpeechToText};