import axios from "axios";
// import { HttpsProxyAgent } from "https-proxy-agent";
import { JSDOM } from "jsdom";

/**
 * 将 YouTube 频道 URL 转换为 YouTube RSS Feed URL
 * @param {string} youtubeUrl - YouTube 频道 Custom URL，例如 https://www.youtube.com/@AkaiHaato
 * @returns {Promise<string>} YouTube RSS Feed URL，例如 https://www.youtube.com/feeds/videos.xml?channel_id=UC1CfXB_kRs3C-zaeTG3oGyg
 */
async function youtubeUrlToFeed(youtubeUrl) {
  // const proxyUrl = "http://127.0.0.1:6666";
  // const proxyAgent = new HttpsProxyAgent(proxyUrl);

  try {
    const channelReq = await axios.get(youtubeUrl, {
      // httpsAgent: proxyAgent,
      timeout: 30000,
      headers: {
        "User-Agent":
          "notion-database-url-to-opml (+https://github.com/tangjan/notion-database-url-to-opml)",
      },
    });

    let channelHTML = channelReq.data;
    const dom = new JSDOM(channelHTML);
    const document = dom.window.document;

    const links = document.querySelectorAll(
      "body > link[rel=alternate], body > link[rel=canonical]"
    );

    const channelIdMatch = [...links]
      .map((e) => e.href.match("/channel/([a-zA-Z0-9_-]+?)$"))
      .find((e) => e != null);

    const channelId = channelIdMatch[1];
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  } catch (error) {
    throw new Error(`${youtubeUrl} 转换失败: ${error.message}`);
  }
}

export default youtubeUrlToFeed;

// test
// console.log(await youtubeUrlToFeed("https://www.youtube.com/@AkaiHaato"));
