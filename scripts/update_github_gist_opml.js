import { Octokit } from "@octokit/rest";
import generateOpmlFromNotion from "./notion_database_youtube_url_to_opml.js";

const octokit = new Octokit({
  auth: process.env.TOKEN_OF_GITHUB,
});

// 更新 GitHub Gist 的 OPML 文件
async function updateGistOpml(opmlContent) {
  try {
    await octokit.rest.gists.update({
      gist_id: process.env.OPML_GIST_ID,
      files: {
        "youtube_vtubers_feeds.opml": {
          content: opmlContent,
        },
      },
    });

    console.log("GitHub Gist 更新成功！");
    console.log(
      `访问链接：https://gist.githubusercontent.com/raw/${process.env.OPML_GIST_ID}/youtube_vtubers_feeds.opml`
    );
  } catch (error) {
    console.error("GitHub Gist 更新失败:", error.message);
    throw error;
  }
}

async function main() {
  const databaseId = process.env.NOTION_VTUBERS_DATABASE_ID;

  try {
    const opmlContent = await generateOpmlFromNotion(
      databaseId,
      "YouTube",
      "Name"
    );
    await updateGistOpml(opmlContent);
    console.log("🎉 完成");
  } catch (error) {
    console.error("❌ 失败:", error);
    process.exit(1);
  }
}

main();
