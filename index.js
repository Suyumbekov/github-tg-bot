import  telegraf from 'telegraf'
import axios from 'axios';
import fs from 'fs';
import https from 'https'
import got from 'got';
import download from 'download-git-repo';
import zipdir from 'zip-dir';
import dotenv from 'dotenv'
dotenv.config()

const bot = new telegraf.Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help(async (ctx) => ctx.reply('Send me a sticker'))
bot.command('download', (ctx) => {
    let data = ctx.update.message.text.split(" ");
    download(`${data[1]}/${data[2]}`, data[2], function (err) {
        console.log(err ? 'Error' : 'Success')
        zipdir(`./${data[2]}`, { saveTo:`./${data[2]}.zip` }, function (err, buffer) {
            console.log(data);
            ctx.telegram.sendChatAction(ctx.chat.id,"upload_document");
            ctx.telegram.sendDocument(ctx.chat.id,{source:`./${data[2]}.zip`});
            fs.rmSync(`./${data[2]}`, { recursive: true, force: true });
          });
      })      
})
bot.command('test', (ctx) => {
    let data = ctx.update.message.text.split(" ");
    download(`${data[1]}/${data[2]}`, data[2], function (err) {
        console.log(err ? 'Error' : 'Success')
      })      
})
bot.command('hi',(ctx)=>{
    let data = ctx.update.message.text.split(" ");

const url = `https://api.github.com/repos/${data[1]}/${data[2]}/zipball`;

const fileName = data[2] + '.zip';

const downloadStream = got.stream(url);
const fileWriterStream = fs.createWriteStream(fileName);

downloadStream
  .on("downloadProgress", ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    console.error(`progress: ${transferred}/${total} (${percentage}%)`);
  })
  .on("error", (error) => {
    console.error(`Download failed: ${error.message}`);
  });

fileWriterStream
  .on("error", (error) => {
    console.error(`Could not write file to system: ${error.message}`);
  })
  .on("finish", () => {
    console.log(`File downloaded to ${fileName}`);
  });

downloadStream.pipe(fileWriterStream);
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))