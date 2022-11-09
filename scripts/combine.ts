import fs, { writeFileSync } from 'fs';
import readline from 'readline';
import yargs from 'yargs'

const argv = yargs(process.argv.slice(2))
    .option('input', {
        alias: 'i',
        type: 'string',
        description: 'file path to read data from',
        default: 'servers.jsonl',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        type: 'string',
        description: 'file path to write results to',
        default: 'servers.json',
        demandOption: true
    })
    .parseSync();

async function processLineByLine() {
    const fileStream = fs.createReadStream(argv.input);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });


    const all = []
    const seen = new Set()

    for await (const line of rl) {

        // repair broken input (exists in 2022-11-09.jsonl)
        const idx = line.lastIndexOf("}")
        if (idx < 0 ) {
            continue
        }

        const s = JSON.parse(line.slice(0, idx+1))
        if (seen.has(s.instance.uri)) {
            continue
        }
        seen.add(s.instance.uri)
        all.push(s)
    }

    writeFileSync(argv.output, JSON.stringify(all))
}

processLineByLine();