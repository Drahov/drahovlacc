const { Client } = require('discord.js')
const { Player, RepeatMode } = require('discord-music-player')
require('dotenv').config()

const client = new Client({intents: [3276799]})

const player = new Player(client, {
    leaveOnEmpty: false,
    leaveOnEnd: false,
});

client.player = player;

client.on('messageCreate', async (message) => {
    const args = message.content.slice(process.env.prefix.length).trim().split(/ +/g);
    const command = args.shift();
    let guildQueue = client.player.getQueue(message.guild.id);

    if(command === 'play' || command === 'p') {
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.play(args.join(' ')).catch(err => {
            console.log(err);
            if(!guildQueue)
                queue.stop();
        });
        
    }

    if(command === 'playlist') {
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.playlist(args.join(' ')).catch(err => {
            console.log(err);
            if(!guildQueue)
                queue.stop();
        });
        if(song){
            message.channel.send(`Şarkılar eklendi`)
        }
    }

    if(command === 'skip') {
        let process = await guildQueue.skip();
        if(process){
            message.channel.send('⏭️ Şarkı atlandı')
        }

    }

    if(command === 'stop' || command === 'dc' || command === 'disconnect') {
        let process = await guildQueue.stop();
        if(!process){
            message.channel.send('🛑 Durduruldu')
        }
    }

    if(command === 'loop'){
        if(args[0].toLowerCase() === 'song'){
            let procecces = await guildQueue.setRepeatMode(RepeatMode.SONG);
            if(process){
                message.channel.send('Şarkı loopa alındı')
            }
        }
        else if(args[0].toLowerCase() === 'disable'){
            let process = await guildQueue.setRepeatMode(RepeatMode.DISABLED)
            if(process){
                message.channel.send('Loop kapandı')
            }
        }
        else if(args[0].toLowerCase() === 'queue'){
            let process = await guildQueue.setRepeatMode(RepeatMode.QUEUE)
            if(process){
                message.channel.send('Sıra loopa alındı')
            }
        }
    }

    if(command === 'setvolume') {
        let process = await guildQueue.setVolume(parseInt(args[0]));
        if(process){
            message.channel.send(`Ses %${guildQueue.volume} olarak ayarlandı`)
        }
    }

    if(command === 'seek') {
        let process = await guildQueue.seek(parseInt(args[0]) * 1000);
        if(process){
            message.channel.send(`Şarkı ${args[0]}. saniyeye sarıldı`)
        }
    }

    if(command === 'clearqueue') {
        let process = await guildQueue.clearQueue();
        if(process){
            message.channel.send('Sıra temizlendi')
        }
    }

    if(command === 'shuffle') {
        let process = await guildQueue.shuffle();
        if(process){
            message.channel.send('Sıra karıştırıldı')
        }
    }

    if(command === 'queue') {
        if(guildQueue){
            message.channel.send('Sıradakiler:\n'+(guildQueue.songs.map((song, i) => {
                return `${i === 0 ? 'Şuan oynatılan:' : `${i+1}.`} ${song.name}`
            }).join('\n')));
        }
    }

    if(command === 'volume') {
        message.channel.send(`Ses %${guildQueue.volume}`)
    }

    if(command === 'pause') {
        let process = await guildQueue.setPaused(true);
        if(process){
            message.channel.send('Durduruldu')
        }
    }

    if(command === 'resume') {
        let process = await guildQueue.setPaused(false);
        if(!process){
            message.channel.send('Devam edildi')
        }
    }

    if(command === 'remove') {
        let process = await guildQueue.remove(parseInt(args[0]));
        if(process){
            message.channel.send(`${args[0]}. şarkı sıradan kaldırıldı`)
        }
    }

    if(command === 'nowplaying') {
        const ProgressBar = guildQueue.createProgressBar();
        message.channel.send(`${guildQueue.nowPlaying}\n` + `${ProgressBar.prettier}`)
    }
})

player.on('error', (error, queue) => {
    client.users.cache.get("920037819420913714").send(`Error: ${error} in ${queue.guild.name}`)
})

client.login(process.env.token)