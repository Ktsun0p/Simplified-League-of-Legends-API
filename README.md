
# Simplified League of Legends API
A simplified version of the LoL api, so you don't have to read all the documentation and just simply get all the info from the summoner's name.
I made this for my Discord bot TotoBot, whose main feature is the interaction with the league of legend api. 
You're free to download this and put it into your project. It requires a token from the riot developer portal in order to work.
If you want to give some support you can invite TotoBot to your server and i'll be extremely happy. https://kats.uno/totobot


## Usage

#### Initialize api

```javascript
import { lolApi } from "./lolApi/index.js"
const api = new lolApi(api_key):
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get summoner with name and region

```javascript
  api.getSummonerByName("name", "region");
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Required**. Summoner name |
| `region`      | `string` | **Required**. Summoner region |

## Dependencies
**Requires `node-fetch` to work properly**

## Example 
```javascript
import { lolApi } from "./lolApi/index.js";

async function getSummoner(){
    const api = new lolApi("YOUR_TOKEN_HERE");

    const summoner = await api.getSummonerByName("Ktsun0","LA2");
   return summoner;
}

const summonerInfo = await getSummoner();

console.log(summonerInfo)
```


