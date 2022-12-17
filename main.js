import discord

TOKEN = "" #トークンを入力
global_channel_name = "taiyaki-global" #設定したいチャンネル名を入力

client = discord.Client() #接続に必要なオブジェクトを生成

@client.event
async def on_message(message):
    if message.channel.name == global_channel_name: #グローバルチャットにメッセージが来たとき
        #メッセージ受信部
        if message.author.bot: #BOTの場合は何もせず終了
            return
        #メッセージ送信部
        for channel in client.get_all_channels(): #BOTが所属する全てのチャンネルをループ
            if channel.name == global_channel_name: #グローバルチャット用のチャンネルが見つかったとき
                if channel == message.channel: #発言したチャンネルには送らない
                    continue

                await channel.send(message.content) #メッセージを送信
                await message.add_reaction('✅')

client.run(TOKEN)
