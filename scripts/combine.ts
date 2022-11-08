import fs, { writeFileSync } from 'fs';
import readline from 'readline';

async function processLineByLine() {
    const fileStream = fs.createReadStream('servers.jsonl');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });


    const all = []
    const seen = new Set()

    for await (const line of rl) {

        const s = JSON.parse(line)
        if (seen.has(s.instance.uri)) {
            continue
        }
        seen.add(s.instance.uri)
        all.push(s)
    }

    writeFileSync("./src/lib/data/servers.json", JSON.stringify(all))
}

processLineByLine();