import { login } from 'masto'
import { appendFileSync } from 'fs'
import { hostname } from 'os'

const timeout = (prom: Promise<any>, time: number) => {
  let timer: NodeJS.Timeout | undefined;
  return Promise.race([
    prom,
    new Promise((_r, rej) => timer = setTimeout(rej, time))
  ]).finally(() => clearTimeout(timer));
}

async function main() {
  // Seed with servers
  let Q = [
    "mastodon.se",
    "mastodon.social",
  ]

  let fetched = new Set()

  while (Q.length > 0) {
    const hostname = Q.shift()
    console.log(hostname, Q.length, fetched.size)

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
        if (!fetched.has(p)) {
          Q.push(p)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
}

main().catch((error) => {
  console.error(error);
});