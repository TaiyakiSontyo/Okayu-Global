import discord
import json
import urllib.parse

TOKEN = "" #トークンを入力
global_channel_name = "taiyaki-global" #設定したいチャンネル名を入力
json_channel_id = 1053544335511126026 #JSONチャンネルID

client = discord.Client() #接続に必要なオブジェクトを生成

@client.event
async def on_message(message):

    if message.channel.name == global_channel_name or message.channel.id == json_channel_id:#グローバルチャットかJSONチャンネルにメッセージが来たとき
        #メッセージ受信部
        if message.channel.name == global_channel_name: #グローバルチャットにメッセージが来たとき
            if message.author.bot: #BOTの場合は何もせず終了
                return

            """ここにJSONの送信部分を記述します"""
            dic = {} #辞書型リストを初期化
            dic.update({"type": "message"}) #JSONで送信するデータの種類: メッセージ
            dic.update({"userId": str(message.author.id)}) #ユーザーID
            dic.update({"userName": message.author.name}) #ユーザーネーム
            dic.update({"userDiscriminator": message.author.discriminator}) #ユーザータグ
            dic.update({"userAvatar": message.author.avatar}) #ユーザーのアバター画像を示すキー
            dic.update({"isBot": message.author.bot}) #ユーザーがBOTかどうか
            dic.update({"guildId": str(message.guild.id)}) #サーバーID
            dic.update({"guildName": message.guild.name}) #サーバー名
            dic.update({"guildIcon": message.guild.icon}) #サーバーアイコン画像を示すキー
            dic.update({"channelId": str(message.channel.id)}) #チャンネルID
            dic.update({"channelName": message.channel.name}) #チャンネル名
            dic.update({"messageId": str(message.id)}) #メッセージID
            dic.update({"content": message.content}) #メッセージ内容

            if message.attachments != []: #添付ファイルが存在するとき
                arr = [] #リストを初期化
                for attachment in message.attachments: #添付ファイルをループ
                    arr.append(attachment.proxy_url) #添付ファイルのURLを追加
                dic.update({"attachmentsUrl": arr})

            if message.reference: #返信のとき
                reference_msg = await message.channel.fetch_message(message.reference.message_id) #メッセージIDから、元のメッセージを取得
                reference_mid = 0 #メンバーID用変数を初期化
                if reference_msg.embeds and reference_msg.author == client.user:  #返信の元のメッセージが、埋め込みメッセージかつ、このBOTが送信したメッセージのとき→グローバルチャットの他のサーバーからのメッセージと判断

                    arr = reference_msg.embeds[0].footer.text.split(" / ") #埋め込みのフッターを「 / 」区切りで取得

                    for ref_msg in arr: #区切ったフッターをループ
                        if "mID:" in ref_msg: #「mID:」が含まれるとき
                            reference_mid = ref_msg.replace("mID:","",1) #「mID:」を取り除いたものをメッセージIDとして取得
                            break

                elif reference_msg.author != client.user: #返信の元のメッセージが、このBOTが送信したメッセージでは無い時→同じチャンネルのメッセージと判断
                    reference_mid = str(reference_msg.id) #返信元メッセージIDを取得

                dic.update({"reference": reference_mid})

            jsondata = json.dumps(dic, ensure_ascii=False) #辞書型リストをJSONに変換
            await client.get_channel(json_channel_id).send(jsondata) #JSONチャンネルにJSONを送信

        if message.channel.id == json_channel_id: #JSONチャンネルにメッセージが来たとき
            if message.author == client.user: #メッセージ送信者がこのBOTの場合は何もせず終了
                return
            """ここにJSONの受信部分を記述します"""

        #メッセージ送信部
        for channel in client.get_all_channels(): #BOTが所属する全てのチャンネルをループ
            if channel.name == global_channel_name: #グローバルチャット用のチャンネルが見つかったとき
                if channel == message.channel: #発言したチャンネルには送らない
                    continue
                    
                embed=discord.Embed(description=dic["content"], color=0x9B95C9) #埋め込みの説明に、メッセージを挿入し、埋め込みのカラーを紫`#9B95C9`に設定
                embed.set_author(name="{}#{}".format(dic["userName"], dic["userDiscriminator"]),icon_url="https://media.discordapp.net/avatars/{}/{}.png?size=1024".format(dic["userId"], dic["userAvatar"]))
                if message.channel.name == global_channel_name:
                    bot_name = "このBOT"
                else:
                    bot_name = message.author.name
                embed.set_footer(text="{} / {} / mID:{}".format(dic["guildName"], bot_name, dic["messageId"]),icon_url="https://media.discordapp.net/icons/{}/{}.png?size=1024".format(dic["guildId"], dic["guildIcon"]))
                if "attachmentsUrl" in dic: #添付ファイルが存在するとき
                    embed.set_image(url=urllib.parse.unquote(dic["attachmentsUrl"][0]))
                if message.reference: #返信メッセージであるとき
                    if message.channel.name == global_channel_name:
                        reference_msg = await message.channel.fetch_message(message.reference.message_id) #メッセージIDから、元のメッセージを取得
                        if reference_msg.embeds and reference_msg.author == client.user: #返信の元のメッセージが、埋め込みメッセージかつ、このBOTが送信したメッセージのとき→グローバルチャットの他のサーバーからのメッセージと判断
                            reference_message_content = reference_msg.embeds[0].description #メッセージの内容を埋め込みから取得
                            reference_message_author = reference_msg.embeds[0].author.name #メッセージのユーザーを埋め込みから取得
                        elif reference_msg.author != client.user: #返信の元のメッセージが、このBOTが送信したメッセージでは無い時→同じチャンネルのメッセージと判断
                            reference_message_content = reference_msg.content #メッセージの内容を取得
                            reference_message_author = reference_msg.author.name+'#'+reference_msg.author.discriminator #メッセージのユーザーを取得
                    else:
                        reference_mid = dic["reference"] #返信元メッセージID

                        reference_message_content = "" #返信元メッセージ用変数を初期化
                        reference_message_author = "" #返信元ユーザータグ用変数を初期化
                        past_dic = None #返信元メッセージの辞書型リスト用変数を初期化

                        async for past_message in message.channel.history(limit=1000): #JSONチャンネルの過去ログ1000件をループ
                            try: #JSONのエラーを監視
                                past_dic = json.loads(past_message.content) #過去ログのJSONを辞書型リストに変換
                            except json.decoder.JSONDecodeError as e: #JSON読み込みエラー→そもそもJSONでは無い可能性があるのでスルー
                                continue
                            if "type" in past_dic and past_dic["type"] != "message": #メッセージでは無い時はスルー
                                continue

                            if not "messageId" in past_dic: #キーにメッセージIDが存在しない時はスルー
                                continue

                            if str(past_dic["messageId"]) == str(reference_mid): #過去ログのメッセージIDが返信元メッセージIDと一致したとき
                                reference_message_author = "{}#{}".format(past_dic["userName"],past_dic["userDiscriminator"]) #ユーザータグを取得
                                reference_message_content = past_dic["content"] #メッセージ内容を取得
                                break
                    reference_content = ""
                    for string in reference_message_content.splitlines(): #埋め込みのメッセージを行で分割してループ
                        reference_content += "> " + string + "\n" #各行の先頭に`> `をつけて結合
                    reference_value = "**@{}**\n{}".format(reference_message_author, reference_content) #返信メッセージを生成
                    embed.add_field(name='返信しました', value=reference_value, inline=True) #埋め込みに返信メッセージを追加
                    
                await channel.send(embed=embed) #メッセージを送信
        await message.add_reaction('✅') #リアクションを送信

client.run(TOKEN)
