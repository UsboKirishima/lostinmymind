import Express from 'express';
import 'dotenv/config';
import { db } from './db';
import CryptoJS from 'crypto-js';

const app = Express();

app.use(Express.json());

app.get('/', async (req, res) => {
    res.send('lostinmymind');
})

app.post('/new', async (req, res) => {
    const body = req.body;

    let id = body.id;
    let key = body.key;

    if (!id || !key) return res.status(401).json({ error: "Missing parameter `id` or `key`" });

    id = id.replace(' ', '_');

    let checkChat = await db.get(`chats.${id}`);

    if (checkChat) return res.status(401).json({ error: `Another chat with 'id: ${id}' is already taken.` })

    await db.set(`chats.${id}`, {
        valid: true
    }).then(async (r) => {
        await console.log(`Created chat with { "id": "${id}", "key": "${key}"`);
    }).catch(async (err) => {
        await res.status(401).json({ error: `Database Error` });
        return console.error(err);
    })

    return res.status(200).json({ id: id, key: key });
});

app.post("/post", async (req, res) => {
    const body = req.body;

    let key = body.key,
        id = body.id,
        content = body.content,
        author = body.author;

    if (!key || !id || !content || !author) return res.status(401).json({ error: "Missing some parameters `id`, `key`, `content`, `author`" });

    //Author/Contents encryption
    let e_content = await CryptoJS.AES.encrypt(content, key).toString();
    let e_author = await CryptoJS.AES.encrypt(author, key).toString();

    let chat = await db.get(`chats.${id}`);

    if (!chat) return res.status(401).json({ error: `\`id\`: \`${id}\` not found. Try to create a chat using GET /new` });

    await db.push(`chats.${id}.messages`, {
        author: e_author,
        content: e_content
    }).then(async (r) => {
        await console.log(`Created message in 'id: "${id}"' with 'content: "${content}"'`);
    }).catch(async (err) => {
        await res.status(401).json({ error: `Database Error` });
        return console.error(err)
    })

    await res.status(200).json({
        author: author,
        content: content
    });
})

app.get("/get", async (req, res) => {
    const body = req.body;

    let key = body.key,
        id = body.id;

    if (!key || !id) return res.status(401).json({ error: "Missing some parameters `id`, `key`" });

    let chat = await db.get(`chats.${id}.messages`).then(async (r) => {
        //Descrypt message array
        await r.map(async (m) => {
            m.author = await CryptoJS.AES.decrypt(m.author, key).toString(CryptoJS.enc.Utf8);
            m.content = await CryptoJS.AES.decrypt(m.content, key).toString(CryptoJS.enc.Utf8);
        })

        await console.log(`Fetched data from id: ${id} key: ${key}`);
        await res.status(200).json(r);
    }).catch(async (err) => {
        await res.status(401).json({ error: `Database Error` });
        return console.error(err)
    });

})


app.listen(process.env.PORT, async () => {
    await console.log(
        "\n                                           .\"\"--.._" +
        "\n                                           []      `'--.._" +
        "\n                                           ||__           `'-," +
        "\n                                         `)||_ ```'--..       \\ " +
        "\n                     _                    /|//}        ``--._  |" +
        "\n                  .'` `'.                /////}              `\\/                        " +
        "\n                 /  .\"\"\".\\              //{///                                  " +
        "\n                /  /_  _`\\\\            // `||                                 " +
        "\n                | |(_)(_)||          _//   ||                                   " +
        "\n                | |  /\\  )|        _///\\   ||                                  " +
        "\n                | |L====J |       / |/ |   ||                                    " +
        "\n               /  /'-..-' /    .'`  \\  |   ||                                   " +
        "\n             /|   `\\-::.| |          \\   | ||                                " +
        "\n           /` `|   /    | |          |   / ||                               ___________________________________  " +
        "\n         |`    \\   |    / /          \\  |  ||                               |                                 |" +
        "\n        |       `\\_|    |/      ,.__. \\ |  ||                               |         lost in my mind         |" +
        `\n        /                     /\`    \`\\ ||  ||                               |      Started on port ${process.env.PORT}       | ` +
        "\n       |           .         /        \\||  ||                               |       made by UsboKirishima     |  " +
        "\n       |                     |         |/  ||                               |                                 |" +
        "\n       /         /           |         (   ||                               |_________________________________|  " +
        "\n      /          .           /          )  ||                               " +
        "\n     |            \\          |             ||" +
        "\n    /             |          /             ||" +
        "\n   |\\            /          |              ||" +
        "\n   \\ `-._       |           /              ||" +
        "\n    \\ ,//`\\    /`           |              ||" +
        "\n     ///\\  \\  |             \\              ||" +
        "\n    |||| ) |__/             |              ||" +
        "\n    |||| `.(                |              ||                       " +
        "\n    `\\\\` /`                 /              ||                                " +
        "\n       /`                   /              ||" +
        "\n      /                     |              ||" +
        "\n     |                      \\              ||                    " +
        "\n    /                        |             ||" +
        "\n  /`                          \\            ||" +
        "\n/`                            |            ||" +
        "\n`-.___,-.      .-.        ___,'            ||" +
        "\n         `---'`   `'----'`     "
    )
});