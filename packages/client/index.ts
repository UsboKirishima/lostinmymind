import {
    banner,
    privacyPolicy,
    list
} from './ascii.js';

import colors from 'colors'

//@ts-ignore
import inquirer from 'inquirer'; //@ts-ignore
import PressToContinuePrompt from 'inquirer-press-to-continue'; //@ts-ignore
import type { KeyDescriptor } from 'inquirer-press-to-continue';

import axios from 'axios';

import 'dotenv/config'

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

const fastChat = async () => {

    await console.clear()
    await mainMenu();

    let id = await getChatId();
    let key = await getChatKey();

    await axios.post(`${process.env.SERVER_URL}/get`, {
        id: `${id}`,
        key: `${key}`
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async (response) => {
        console.table(response.data);
    }).catch(async (error) => {
        console.log(error);
    });
}

const parseOption = async () => {

    let opt = await options();

    switch (opt) {
        case '1' || '01':
            break;
        case '2' || '02':
            break;
        case '3' || '03':
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