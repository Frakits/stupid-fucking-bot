process.stdin.resume(); // so the program will not close instantly


const { Client, Events, GatewayIntentBits } = require('discord.js');
fs = require('fs');
ini = require('ini');

let token = ini.parse(fs.readFileSync('./config.ini', 'utf-8')).token;
let db = JSON.parse(fs.readFileSync('./userdata.json', 'utf-8'));
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    const channel = client.channels.cache.get('1154750800904593418');
    channel.send("ok im back");
});
client.login(token);
client.on(Events.MessageCreate, async message => {
    if (message.channelId != 1154750800904593418) return;
    if (!message.author.bot) {
        switch (message.content.toLowerCase()) {
			case 'how much xp left':
				message.reply((Math.round(100 * (db[message.author.id].lv * 0.043) * 100) / 100 - db[message.author.id].xp).toString());
				return;
		}
        let tsMultiplier;
        if (db[message.author.id] == null) {
            db[message.author.id] = { xp: 1, ts: message.createdTimestamp / 5, lv: 1, xpTotal: 1 };
            message.reply(`db account created for ${message.author.id}`);
            return
        }
        switch (message.content.toLowerCase()) {
			case 'how much xp left':
				message.reply((Math.round(100 * (db[message.author.id].lv * 0.043) * 100) / 100 - db[message.author.id].xp).toString());
				break;
            default:
                let dbuser = db[message.author.id];
                tsMultiplier = +(Math.round((((message.createdTimestamp / 5) - dbuser.ts) / 8200) + "e+2") + "e-2"); //time between messages
                tsMultiplier += Math.max(Math.min((10000 - ((message.createdTimestamp / 5) - dbuser.ts)) / 2000, 0.01), -(tsMultiplier)); //penalize for taking too long to send messages
                if (message.content.length != 0) {
                    tsMultiplier += ((findUnique(message.content).length) - message.content.length / 10) / 40; //unique characters minus the amount of total characters
                    if (emotes(message.content) != null) tsMultiplier /= emotes(message.content).length + 1;
                    if (message.content.includes('http')) tsMultiplier /= message.content.length;
                }
                console.log(message.content);
                dbuser.xpTotal = Math.round((dbuser.xpTotal + 1 * tsMultiplier) * 100) / 100;
                dbuser.xp = Math.round((dbuser.xp + 1 * tsMultiplier) * 100) / 100;
                message.reply(`hi ur total xp is ${dbuser.xp}xp with the increase of ${(Math.round(tsMultiplier * 100) / 100)}xp (ur total lifetime xp is ${dbuser.xpTotal}`);
    
                dbuser.ts = message.createdTimestamp / 5;
    
                if (dbuser.xp > 100 * (dbuser.lv * 0.043)) {
                    dbuser.xp = 0;
                    dbuser.lv += 1;
                    message.reply(`also u just reached level ${dbuser.lv} and need to reach ${Math.round(100 * (dbuser.lv * 0.043) * 100) / 100} for the next level`);
                }
		}
    }
});
const emotes = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);

async function exitHandler(message) {
    const channel = await client.channels.fetch('1154750800904593418');
    await channel.send("bye (" + message);
    fs.writeFileSync('userdata.json', JSON.stringify(db, null, 4), function(err) {
        if (err) console.log(err);
    });
    console.log("closed");
    process.exit();
}
function findUnique(str) {
    return [...str].reduce((acc, curr) => {
        return acc.includes(curr) ? acc : acc + curr;
    }, "")
}
process.on('exit', exitHandler.bind(null, "im being closed help"));
process.on('SIGINT', exitHandler.bind(null, "im being closed help"));
process.on('SIGUSR1', exitHandler.bind(null, "im being closed help"));
process.on('SIGUSR2', exitHandler.bind(null, "im being closed help"));
process.on('uncaughtException', function(err) {
    console.log(err);
    exitHandler("i just crashed lmfao btw heres the error \n\n" + err);
});