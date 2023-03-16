import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const TelegramBot = require('node-telegram-bot-api')
const dotenv = require('dotenv')
const fs = require('fs');
const axios = require("axios");

import fetch from "cross-fetch";

dotenv.config()
const token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(token, { polling: true })
const gifPath = './MauAptos.mp4';
let chatId = '-1001878116163';
let nPrevSequenceNumber = -1;
let bBotStart = false;

bot.onText(/\/mau/, (msg) => {
  chatId = msg.chat.id;
  console.log("ChatId", chatId);
});

const ExecuteFunction = async () => {
  const url = "https://fullnode.mainnet.aptoslabs.com/v1/accounts/0x2ad8f7e64c7bffcfe94d7dea84c79380942c30e13f1b12c7a89e98df91d0599b/events/0x2ad8f7e64c7bffcfe94d7dea84c79380942c30e13f1b12c7a89e98df91d0599b::swap::PairEventHolder%3C0x1::aptos_coin::AptosCoin,0xf8fa55ff4265fa9586f74d00da4858b8a0d2320bbe94cb0e91bf3a40773eb60::MAU::MAU%3E/swap?limit=100";
  let event_data_res = await fetch(url);
  let event_data = await event_data_res.json();

  // console.log(event_data);

  let priceAPT = 0;
  while(priceAPT == 0)
  {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd');
      const price = response.data.aptos.usd;
      priceAPT = price;
    }
    catch (error) {
    }
  }
  try{
    let nCnt = event_data.length;
    // for(let i=nCnt-1;i>=0;i--)
    
    if(event_data[nCnt-1].sequence_number <= nPrevSequenceNumber)
      return;

    for(let i=0; i<nCnt; i++)
    {
      console.log("event_data[i].sequence_number", event_data[i].sequence_number);
      if(event_data[i].sequence_number > nPrevSequenceNumber)
      {
        let nAptogeCnt = parseInt(event_data[i].data.amount_y_out)/1000000;
        let nAptosCnt = parseInt(event_data[i].data.amount_x_in)/100000000;

        console.log("nAptogeCnt", nAptogeCnt);
        console.log("nAptosCnt", nAptosCnt);

        if(nAptogeCnt > 0)
        {
          const vVersion = event_data[i].version;
          const urlTransaction = "https://fullnode.mainnet.aptoslabs.com/v1/transactions/by_version/" + vVersion;
          let transactionVersion = await fetch(urlTransaction);
          let getTransaction = await transactionVersion.json();
          let vTransaction = getTransaction.hash;
          vTransaction = "https://explorer.aptoslabs.com/txn/" + vTransaction;
          let vSender = getTransaction.sender;
          vSender = "https://explorer.aptoslabs.com/account/" + vSender;
  
          let AptosDisplayPrice = priceAPT * nAptosCnt;
          let formattedNum = AptosDisplayPrice.toFixed(3);
          AptosDisplayPrice = parseFloat(formattedNum);
  
          formattedNum = nAptosCnt.toFixed(2);
          nAptosCnt = parseFloat(formattedNum);
  
          let priceAptoge = AptosDisplayPrice/nAptogeCnt;
          formattedNum = priceAptoge.toFixed(7);
          priceAptoge = parseFloat(formattedNum);
  
          formattedNum = nAptogeCnt.toFixed(2);
          nAptogeCnt = parseFloat(formattedNum);
  
          let marketCap = priceAptoge * 1000000;
          formattedNum = marketCap.toFixed(2);
          marketCap = parseFloat(formattedNum);
  
          let msg = "🐈‍⬛🐈‍⬛ MAU Aptos Buy! 🐈‍⬛🐈‍⬛" + 
                    "\n\n";
          
          for(let j=0;j<(AptosDisplayPrice/10);j++)
          {
            msg += "🐈‍⬛";
          }
  
          msg += "\n\n" +
              "<b>Spent:</b>" + " $" + AptosDisplayPrice + "(" + nAptosCnt + " APT)\n" +
              "<b>Got:</b>" + " " + nAptogeCnt + " MAU\n" + 
              "<b>Price:</b>" + " $" + priceAptoge + "\n" +
              "<b>Market cap:</b>" + " $" + marketCap + "K" +
              "\n\n"+
              "<a href=\"" + vTransaction + "\">Tx</a>" + " | " + "<a href=\"https://www.dextools.io/app/en/aptos/pair-explorer/0x2ad8f7e64c7bffcfe94d7dea84c79380942c30e13f1b12c7a89e98df91d0599b%3C0x1::aptos_coin::AptosCoin-0xf8fa55ff4265fa9586f74d00da4858b8a0d2320bbe94cb0e91bf3a40773eb60::MAU::MAU%3E\">Chart</a>" + " | " + "<a href=\"" + vSender + "\">Buyer</a>" + " | " + "<a href=\"https://baptswap.com/swap?inputToken=0x1::aptos_coin::AptosCoin&outputToken=0xf8fa55ff4265fa9586f74d00da4858b8a0d2320bbe94cb0e91bf3a40773eb60::MAU::MAU\">Buy Now</a>";
  
          bot.sendVideo(chatId, gifPath, {
            caption:msg,
            parse_mode: 'HTML'
          });
  
          // if(bBotStart == false)
          // {
          //   bBotStart = true;
          //   break;
          // }
        }
      }
      else
      {
        break;
      }
    }
    nPrevSequenceNumber = event_data[nCnt-1].sequence_number;
  }catch(e){
    console.log(e);
  }
  
}

if(bot.isPolling()) {
  await bot.stopPolling();
}
await bot.startPolling();

var interval = setInterval(function() {
  ExecuteFunction();
}, 10000);