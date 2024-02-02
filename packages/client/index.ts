import {
    banner,
    privacyPolicy,
    list
} from './ascii.js';

//@ts-ignore
import colors from 'colors'

//@ts-ignore
import inquirer from 'inquirer'; //@ts-ignore
import PressToContinuePrompt from 'inquirer-press-to-continue'; //@ts-ignore
import type { KeyDescriptor } from 'inquirer-press-to-continue';

import axios from 'axios';

import { QuickDB } from "quick.db";

export const db = new QuickDB();

import 'dotenv/config'

interface MessageType {
    author: string;
    content: string;
}

interface ChatType {
    id: string;
    key: string;
}

const privacyAccept = async () => {
    await console.log(colors.red(banner));
    await console.log(colors.red(privacyPolicy));
}

const mainMenu = async () => {
    await console.log(colors.red(banner));
    await console.log(colors.red(list));
}

const options = async () => {
    const { options } = await inquirer.prompt([
        {
            type: 'input',
            name: 'options',
            prefix: '',
            message: `${colors.cyan('main')}@${colors.red('lostinmymind')} ${colors.cyan('~')} $ `
        },
    ])

    return options;
};

const getChatId = async () => {
    const { chatId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'chatId',
            prefix: '',
            message: `${colors.dim('Chat id')} ${colors.cyan('~')} $ `
        },
    ]);

    return chatId;
}

const getChatKey = async () => {
    const { chatKey } = await inquirer.prompt([
        {
            type: 'input',
            name: 'chatKey',
            prefix: '',
            message: `${colors.dim('Chat encryption key')} ${colors.cyan('~')} $ `
        },
    ]);

    return chatKey;
}

const getChatUsername = async () => {
    const { chatUsername } = await inquirer.prompt([
        {
            type: 'input',
            name: 'chatUsername',
            prefix: '',
            message: `${colors.dim('Chat username')} ${colors.cyan('~')} $ `
        },
    ]);

    return chatUsername;
}

const createChat = async () => {
    await console.clear()
    await mainMenu();

    let id = await getChatId();
    let key = await getChatKey();

    let data;

    await axios.post(`${process.env.SERVER_URL}/new`, {
        id: `${id}`,
        key: `${key}`
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        if (response.status == 200) {
            await console.log(colors.green(`Successfully created new chat with \`id: ${response.data.id}\` and \`key: ${response.data.key}\` & added to client`))
            await db.push(`client.chats`, {
                id: `${id}`,
                key: `${key}`
            });
        } else if (response.status == 401)
            await console.error(`${colors.red('ERROR')} ${colors.dim(`~ ${response.data.error || 'Found an error. If you think this is a bug contact us at https://github.com/UsboKirishima/lostinmymind/issues'}`)}`)
        else
            await console.error('Found an error. If you think this is a bug contect use at https://github.com/UsboKirishima/lostinmymind/issues');
    }).catch(async (error) => {
        if (error.status == 200)
            await console.log(colors.green(`Successfully created new chat with \`id: ${error.data.id}\` and \`key: ${error.data.key}\``))
        else if (error.status == 401)
            await console.error(`${colors.red('ERROR')} ${colors.dim(`~ ${error.data.error || 'Found an error. If you think this is a bug contact us at https://github.com/UsboKirishima/lostinmymind/issues'}`)}`)
        else
            await console.error('Found an error. If you think this is a bug contect use at https://github.com/UsboKirishima/lostinmymind/issues');
    });

}

const fastChat = async () => {

    await console.clear()
    await mainMenu();

    let id = await getChatId();
    let key = await getChatKey();
    let username = await getChatUsername();

    let data;

    await axios.post(`${process.env.SERVER_URL}/get`, {
        id: `${id}`,
        key: `${key}`
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        //console.table(response.data);
        data = response.data;
    }).catch(async (error) => {
        console.log(error);
    });

    await data.map(async (message: MessageType) => {
        let contentSplitted = await message.content.split('');
        let formattedContent = "┌──────────────────────────────────────────┐";

        for (let i = 0; i <= message.content.length; i = i + 40) {
            formattedContent += `\n│ ${await message.content.slice(i, i + 40)} ${message.content.length >= 40 ? '│' : ''}`;
        }

        //formattedContent = formattedContent.slice(-1);

        if (message.content.length >= 40) {
            /*for(let i = 1; i <= message.content.length % 40; i++) {
                formattedContent += " ";
            }*/
        } else {
            for (let i = 1; i <= 40 - message.content.length % 40; i++) {
                formattedContent += " ";
            }
        }

        formattedContent += "│";
        formattedContent += "\n└──────────────────────────────────────────┘";

        let formattedSenderMessage = `${colors.green(message.author)}\n${colors.dim(formattedContent)}`;


        if (message.author === username) {
            await console.log(formattedSenderMessage);
        } else {
            await console.log(formattedSenderMessage);
        }
    })
}

const openChat = async () => {
    const { openChat } = await inquirer.prompt([
        {
            type: 'input',
            name: 'openChat',
            prefix: '',
            message: `${colors.cyan('chats')}@${colors.red('lostinmymind')} ${colors.cyan('~')} $ `
        },
    ])

    return openChat;
};

const allChats = async () => {
    await console.clear()
    await mainMenu();

    let chats: ChatType[] = await db.get('client.chats');

    if(!chats || chats === null || chats === undefined) 
        await console.log(colors.red('No chats yet!'));

    let i = 0;

    await console.log(`     ${colors.blue(`{0}`)} ${colors.dim(`Back`)}`);

    await chats.map(async (chat: ChatType) => {
        i++;
        await console.log(`     ${colors.blue(`{${i}}`)} ${colors.dim(`${chat.id}`)}`);
    })

    let selectedChat = await openChat(); 

    if(selectedChat == "0" || selectedChat == "00") return;

    
    let username = await getChatUsername();
    let data;

    await axios.post(`${process.env.SERVER_URL}/get`, {
        id: `${chats[parseInt(selectedChat) - 1].id}`,
        key: `${chats[parseInt(selectedChat) - 1].key}`
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        //console.table(response.data);
        data = response.data;
    }).catch(async (error) => {
        //console.log(error);
    });

    if(!data || data === null || data === undefined) return await console.log('No messages found yet!')

    await data.map(async (message: MessageType) => {
        let contentSplitted = await message.content.split('');
        let formattedContent = "┌──────────────────────────────────────────┐";

        for (let i = 0; i <= message.content.length; i = i + 40) {
            formattedContent += `\n│ ${await message.content.slice(i, i + 40)} ${message.content.length >= 40 ? '│' : ''}`;
        }

        //formattedContent = formattedContent.slice(-1);

        if (message.content.length >= 40) {
            /*for(let i = 1; i <= message.content.length % 40; i++) {
                formattedContent += " ";
            }*/
        } else {
            for (let i = 1; i <= 40 - message.content.length % 40; i++) {
                formattedContent += " ";
            }
        }

        formattedContent += "│";
        formattedContent += "\n└──────────────────────────────────────────┘";

        let formattedSenderMessage = `${colors.green(message.author)}\n${colors.dim(formattedContent)}`;


        if (message.author === username) {
            await console.log(formattedSenderMessage);
        } else {
            await console.log(formattedSenderMessage);
        }
    })
}

const parseOption = async () => {

    while (1) {

        let opt = await options();

        switch (opt) {
            case '1' || '01':
                await allChats();
                break;
            case '2' || '02':
                break;
            case '3' || '03':
                await createChat();
                break;
            case '4' || '04':
                await fastChat();
                break;
            default:
                await console.error(`${colors.red('ERROR')} ${colors.dim(`~ Invalid option: ${opt}`)}`)
                await new Promise(r => setTimeout(r, 500));
                await console.clear();
                await mainMenu();
                await parseOption();
        }

        await new Promise(r => setTimeout(r, 3000));
        await console.clear()
        await mainMenu();
    }
}


const main = async () => {
    await console.clear();
    await privacyAccept();

    /**
     * Privacy & Tos accepting
     */

    inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);

    await console.log();

    const { key: enterKey } = await inquirer.prompt<{ key: KeyDescriptor }>({
        name: 'key',
        type: 'press-to-continue',
        enter: true,
        pressToContinueMessage: colors.red('Press enter to continue...')
    });

    await console.clear();
    await mainMenu();

    await parseOption();
}

(async () => {
    await main();
})();