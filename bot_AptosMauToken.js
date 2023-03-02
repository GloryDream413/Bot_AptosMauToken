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
let chatId = '';
let nPrevSequenceNumber = 0;
let bBotStart = false;

bot.onText(/\/mau/, (msg) => {
  chatId = msg.chat.id;
});

const ExecuteFunction = async () => {
  const url = "https://fullnode.mainnet.aptoslabs.com/v1/accounts/0x05a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948/events/0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::EventsStore%3C0xf8fa55ff4265fa9586f74d00da4858b8a0d2320bbe94cb0e91bf3a40773eb60::MAU::MAU,%200x1::aptos_coin::AptosCoin,%200x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated%3E/swap_handle?limit=100";
  let event_data_res = await fetch(url);
  let event_data = await event_data_res.json();

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

  let nCnt = event_data.length;
  for(let i=nCnt-1;i>=0;i--)
  {
    if(event_data[i].sequence_number > nPrevSequenceNumber)
    {
      let nAptogeCnt = parseInt(event_data[i].data.x_out)/1000000;
      let nAptosCnt = parseInt(event_data[i].data.y_in)/100000000;
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
            "\n\n" +
            "<a href=\"" + vTransaction + "\">Tx</a>" + " | " + "<a href=\"https://dexscreener.com/aptos/liquidswap-41629\">Chart</a>" + " | " + "<a href=\"" + vSender + "\">Buyer</a>" + " | " + "<a href=\"https://liquidswap.com/#/\">Buy Now</a>";

        bot.sendVideo(chatId, gifPath, {
          caption:msg,
          parse_mode: 'HTML'
        });

        if(bBotStart == false)
        {
          bBotStart = true;
          break;
        }
      }
    }
    else
    {
      break;
    }
  }
  nPrevSequenceNumber = event_data[nCnt-1].sequence_number;
}

if(bot.isPolling()) {
  await bot.stopPolling();
}
await bot.startPolling();

var interval = setInterval(function() {
  ExecuteFunction();
}, 10000);