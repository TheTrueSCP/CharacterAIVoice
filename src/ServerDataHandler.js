require('dotenv').config();
const fs = require("fs");

var characterLockData = new Map();


function writeArrayToJson(jsonPath, array)
{
    var array = JSON.stringify(array);

    try
    {
        fs.writeFileSync(jsonPath, array);
        return true;
    }
    catch(err)
    {
        return false;
    }
}

function readArrayFromJson(jsonPath)
{
    try
    {
        return new Array(JSON.parse(fs.readFileSync(jsonPath)));
    }
    catch(err)
    {
        return null;
    }
}


function WriteObjectToJson(jsonPath, object)
{
    var json = JSON.stringify(object);

    try
    {
        fs.writeFileSync(jsonPath, json);
        return true;
    }
    catch(err)
    {
        return false;
    }
}

function readObjectFromJson(jsonPath)
{
    try
    {
        return new Object(JSON.parse(fs.readFileSync(jsonPath)));
    }
    catch(err)
    {
        return null;
    }
}


function WriteMapToJson(jsonPath, map)
{
    var json = JSON.stringify(Object.fromEntries(map));

    try
    {
        fs.writeFileSync(jsonPath, json);
        return true;
    }
    catch(err)
    {
        return false;
    }
}

function ReadMapFromJson(jsonPath)
{
    try
    {
        return new Map(Object.entries(JSON.parse(fs.readFileSync(jsonPath))));
    }
    catch(err)
    {
        return null;
    }
}

function ReadMapFromJsonOrCreate(jsonPath)
{
    try
    {
        return new Map(Object.entries(JSON.parse(fs.readFileSync(jsonPath))));
    }
    catch(err)
    {
        var success = WriteMapToJson(jsonPath, new Map([]));

        if(!success)
        console.error("Cant write map to json");


        return ReadMapFromJson(jsonPath);
    }
}

//Get|Set
function setCharacterGenerateLock(characterID, lock)
{
    characterLockData.set(characterID, lock);
}

function getCharacterGenerateLock(characterID)
{
    var lock = characterLockData.get(characterID);
    
    if(lock === undefined || lock === null)
    {
        return false;
    }
    else
    {
        return lock;
    }
}



function setCharacterID(serverID, characterID)
{
    var oldCharacterIDMap = ReadMapFromJsonOrCreate(process.env.CHANNELS_DATA_PATH);
    oldCharacterIDMap.set(serverID, characterID);

    WriteMapToJson(process.env.CHARACTER_DATA_PATH, oldCharacterIDMap);
}

function getCharacterID(serverID)
{
    var characterMap = ReadMapFromJsonOrCreate(process.env.CHARACTER_DATA_PATH);

    var character = characterMap.get(serverID);
    
    if(character === undefined || character === null)
    {
        return null;
    }
    else
    {
        return character;
    }
}

function setChatChannel(serverID, chatChannel)
{
    var oldChatChannelMap = ReadMapFromJsonOrCreate(process.env.CHANNELS_DATA_PATH);
    oldChatChannelMap.set(serverID, chatChannel);

    WriteMapToJson(process.env.CHANNELS_DATA_PATH, oldChatChannelMap);
}

function getChatChannel(serverID)
{
    var chatChannelMap = ReadMapFromJsonOrCreate(process.env.CHANNELS_DATA_PATH);

    var chatChannel = chatChannelMap.get(serverID);
    
    if(chatChannel === undefined || chatChannel === null)
    {
        return null;
    }
    else
    {
        return chatChannel;
    }
}


module.exports = {setCharacterGenerateLock, getCharacterGenerateLock, getCharacterID, setCharacterID, writeArrayToJson,readArrayFromJson, WriteMapToJson, ReadMapFromJson, getChatChannel, setChatChannel};