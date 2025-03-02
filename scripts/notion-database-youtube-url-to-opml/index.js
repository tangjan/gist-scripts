import { Octokit } from "@octokit/rest";
import generateOpmlFromNotion from "./notion_database_youtube_url_to_opml.js";

const octokit = new Octokit({
  auth: process.env.TOKEN_OF_GITHUB_GIST,
});

async function main() {
  try {
    const opmlContent = await generateOpmlFromNotion(
      "18fef38846658065afe3fcdfa307e553",
      "YouTube",
      "Name"
    );
    await octokit.rest.gists.update({
      gist_id: "186d3098cd847b22e9117306ab4d5161",
      files: {
        "youtube_vtubers_feeds.opml": {
          content: opmlContent,
        },
      },
    });
    console.log("🎉GitHub Gist 更新完成!");
    console.log(
      `访问链接：https://gist.github.com/tangjan/186d3098cd847b22e9117306ab4d5161`
    );
  } catch (error) {
    console.error(error);
  }
}

main();
