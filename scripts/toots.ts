import { login } from 'masto'
import { appendFileSync, createWriteStream } from 'fs'
import fs from 'fs';
import readline from 'readline';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'file path to write results to',
		default: './crawled/servers.jsonl',
		demandOption: true
	})
  .option('discover', {
    type: 'boolean',
    description: 'also fetch the peers of crawled servers',
    default: false,
    demandOption: true,
  })
	.parseSync();

const timeout = (prom: Promise<any>, time: number) => {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    prom,
    new Promise((_r, rej) => timer = setTimeout(rej, time))
  ]).finally(() => clearTimeout(timer));
}

const fetchedServers = async (): Promise<Set<string>> => {
  const seen = new Set<string>();
  if (!fs.existsSync(argv.output)) {
    return seen
  }

  const fileStream = fs.createReadStream(argv.output);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    const s = JSON.parse(line)
    seen.add(s.instance.uri)
  }

  return seen
}

const failedServers = async (): Promise<Set<string>> => {
  const fileStream = fs.createReadStream('./crawled/failed.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const seen = new Set<string>();

  for await (const line of rl) {
    seen.add(line)
  }

  return seen
}

const onlineServers = async (): Promise<Set<string>> => {
  // known online servers
  const fileStream = fs.createReadStream('./crawled/online.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const seen = new Set<string>();

  for await (const line of rl) {
    seen.add(line)
  }

  return seen
}

async function main() {
  // Seed with servers
  let Q = [
    "mastodon.online",
    "mastodon.se",
    "mastodon.social",
  ]

  // Seed with known online servers
  const online = await onlineServers()
  for (const o of online) {
    Q.push(o)
  }

  const fetched = await fetchedServers() // servers already fetched (makes the script resumeable)
  const seen = new Set(Q) // servers in queue
  const failed = await failedServers()

  const stream = createWriteStream(argv.output, { flags: 'a' });

  while (Q.length > 0) {
    const hostname = Q.shift()

    if (!hostname) {
      continue
    }
    if (hostname.includes(".gab.best") || hostname.includes(".onion")) {
      continue
    }

    console.log(hostname, Q.length, fetched.size)

    // this server is known to fail, do not bother
    if (failed.has(hostname)) {
      console.log("skip, failing server")
      continue
    }

    if (fetched.has(hostname) && hostname !== "mastodon.social") {
      console.log("skip, already fetched")
      continue
    }

    try {
      fetched.add(hostname)

      const masto = await timeout(login({
        url: `https://${hostname}`,
      }), 1000);

      fetched.add(hostname)

      const [instance, peers, activity] = await Promise.all([
        timeout(masto.instances.fetch(), 2000),
        timeout(masto.instances.fetchPeers(), 2000),
        timeout(masto.instances.fetchActivity(), 2000),
      ])

      const d = {
        instance,
        activity,
      }

      stream.write(JSON.stringify(d) + "\n")

      // Add peers to crawl queue
      if (argv.discover) {
        for (const p of peers) {
          if (!seen.has(p)) {
            Q.push(p)
            seen.add(p)
          }
        }
      }

    } catch (e) {
      console.log("failed to crawl", hostname)
      appendFileSync("./craled/failed.txt", hostname + "\n")
      failed.add(hostname)
    }
  }
}

main().catch((error) => {
  console.error(error);
});