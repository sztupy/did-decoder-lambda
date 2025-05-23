import { Router } from "express";
import { Resolver } from 'did-resolver'
import { getResolver } from 'plc-did-resolver'
import axios from "axios";

const router = Router();

router.get("/cache", async (req, res) => {
  const mediaUrl = String(req.query?.media)

  if (!mediaUrl) {
    return res.sendStatus(404)
  }

  // TODO: to support bluesky images, we should receive full URLs built on frontend and not just cids
  if (mediaUrl.startsWith('?cid=')) {
    try {
      const did = decodeURIComponent(mediaUrl.split('&did=')[1])
      const cid = decodeURIComponent(mediaUrl.split('&did=')[0].split('?cid=')[1])
      if (!did || !cid) {
        return res.sendStatus(404)
      }

      const plcResolver = getResolver()
      const didResolver = new Resolver(plcResolver)
      const didData = await didResolver.resolve(did)
      if (didData?.didDocument?.service) {
        const url =
          didData.didDocument.service[0].serviceEndpoint +
          '/xrpc/com.atproto.sync.getBlob?did=' +
          encodeURIComponent(did) +
          '&cid=' +
          encodeURIComponent(cid)

        const remoteResponse = await axios.get(url, {
          responseType: 'stream',
          headers: { 'User-Agent': process.env.DOMAIN_NAME || 'did-decoder-lmabda' }
        })

        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        remoteResponse.data.pipe(res);
        return
      }
    } catch (error) {
      console.log(error)
      return res.sendStatus(500)
    }
  }
  return res.sendStatus(404)
});

export default router;
