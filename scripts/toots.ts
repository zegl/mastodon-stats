import { login } from 'masto'
import { appendFileSync } from 'fs'
import fs, { writeFileSync } from 'fs';
import readline from 'readline';

const timeout = (prom: Promise<any>, time: number) => {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    prom,
    new Promise((_r, rej) => timer = setTimeout(rej, time))
  ]).finally(() => clearTimeout(timer));
}

const fetchedServers = async (): Promise<Set<string>> => {
  const fileStream = fs.createReadStream('servers.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const seen = new Set<string>();

  for await (const line of rl) {
    const s = JSON.parse(line)
    seen.add(s.instance.uri)
  }

  return seen
}

const failedServers = async (): Promise<Set<string>> => {
  const fileStream = fs.createReadStream('failed.txt');

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
    "abdl.link",
    "alive.bar",
    "c.im",
    "climatejustice.social",
    "fosstodon.org",
    "gensokyo.social",
    "hostux.social",
    "m.cmx",
    "m.rthome",
    "mamot.fr",
    "mas.to",
    "mas.to",
    "masthead.social",
    "mastodon.art",
    "mastodon.bida",
    "mastodon.cloud",
    "mastodon.green",
    "mastodon.lol",
    "mastodon.online",
    "mastodon.se",
    "mastodon.social",
    "mastodon.technology",
    "mastodon.top",
    "mastodon.uno",
    "mastodon.world",
    "mastodon.xyz",
    "mastodonapp.uk",
    "meow.social",
    "mstdn.io",
    "mstdn.jp",
    "mstdn.social",
    "pawoo.net",
    "pixelfed.social",
    "poa.st",
    "qoto.org",
    "ravenation.club",
    "sfba.social",
    "social.tchncs",
    "toot.communit",
    "troet.cafe",
    "wxw.moe",
  ]

  const fetched = await fetchedServers() // servers already fetched
  const seen = new Set(Q) // servers in queue
  const failed = await failedServers()

  while (Q.length > 0) {
    const hostname = Q.shift()

    if (!hostname) {
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
        // timeout: 5,
      }), 1000);

      fetched.add(hostname)

      const [instance, peers, activity] = await Promise.all([
        timeout(masto.instances.fetch(), 2000),
        timeout(masto.instances.fetchPeers(), 2000),
        timeout(masto.instances.fetchActivity(), 2000),
      ])

      const d = {
        instance,
        // peers,
        activity,
      }

      appendFileSync("servers.jsonl", JSON.stringify(d) + "\n")

      // Add peers to crawl queue
      for (const p of peers) {
        if (!seen.has(p)) {
          Q.push(p)
          seen.add(p)
        }
      }
    } catch (e) {
      // console.error(e)
      console.log("failed to crawl", hostname)
      appendFileSync("failed.txt", hostname + "\n")
      failed.add(hostname)
    }
  }
}

main().catch((error) => {
  console.error(error);
});