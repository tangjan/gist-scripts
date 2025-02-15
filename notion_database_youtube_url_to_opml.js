import { Client } from "@notionhq/client";
import youtubeUrlToFeed from "./youtube_url_to_feed.js";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * 从 Notion 数据库获取所有数据，处理分页
 * @param {string} databaseId - 数据库ID
 * @returns {Promise<Array>} 所有数据
 */
async function getAllDatabaseEntries(databaseId) {
  let allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
      // 过滤掉 "💤 休眠中" 或 "🎓 毕业" 的 Vtuber
      filter: {
        and: [
          {
            property: "Tags",
            multi_select: {
              does_not_contain: "💤 休眠中",
            },
          },
          {
            property: "Tags",
            multi_select: {
              does_not_contain: "🎓 毕业",
            },
          },
        ],
      },
    });

    allResults = [...allResults, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allResults;
}

/**
 * 从 Notion 数据库获取 YouTube URL 并转换为 OPML 数据
 * @param {string} databaseId - Notion数据库ID
 * @param {string} urlPropertyName - 包含YouTube URL的属性名称
 * @param {string} namePropertyName - 包含频道名称的属性名称
 * @returns {Promise<void>}
 */
async function generateOpmlFromNotion(
  databaseId,
  urlPropertyName,
  namePropertyName
) {
  try {
    const results = await getAllDatabaseEntries(databaseId);
    console.log(`获取到 ${results.length} 条数据`);

    const conversionPromises = results.map(async (page) => {
      const youtubeUrl = page.properties[urlPropertyName]?.url;
      const channelName =
        page.properties[namePropertyName]?.title[0]?.plain_text;

      try {
        const feedUrl = await youtubeUrlToFeed(youtubeUrl);
        console.log(`成功：${youtubeUrl} -> ${feedUrl}`);
        return {
          channelName: channelName,
          feedUrl,
          youtubeUrl,
        };
      } catch (error) {
        console.error(`处理 ${youtubeUrl} 时出错:`, error.message);
        return null;
      }
    });

    const processedResults = (await Promise.all(conversionPromises)).filter(
      Boolean
    );
    console.log(`成功处理 ${processedResults.length} 个频道`);

    // OPML 文件内容
    const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>YouTube Vtuber Feeds</title>
    <ownerName>Jan Tang</ownerName>
    <ownerEmail>tangjiayan2019@gmail.com</ownerEmail>
  </head>
  <body>
    ${processedResults
      .map(
        ({ channelName, feedUrl, youtubeUrl }) => `
    <outline
      text="${channelName}"
      title="${channelName}"
      type="rss"
      xmlUrl="${feedUrl}"
      htmlUrl="${youtubeUrl}"/>`
      )
      .join("\n")}
  </body>
</opml>`;

    return opmlContent;
  } catch (error) {
    console.error("生成OPML失败:", error);
    throw error;
  }
}

export default generateOpmlFromNotion;
