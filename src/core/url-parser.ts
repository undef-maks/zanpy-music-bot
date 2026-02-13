export type PlayPlatform = "youtube" | "soundcloud" | null;
export type ContentCategory = "playlist" | "video";

export interface ResourceInfo {
  platform: PlayPlatform;
  category: ContentCategory;
  id: string | null;
  url: string;
}

export function parseResourceUrl(url: string): ResourceInfo | null {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");

    if (host === "music.youtube.com") {
      const listId = parsedUrl.searchParams.get("list");
      if (listId) {
        return {
          platform: "youtube",
          category: "playlist",
          id: listId,
          url
        };
      }
    }

    if (host === "youtube.com" || host === "youtu.be") {
      const isPlaylist = parsedUrl.searchParams.has("list");
      if (isPlaylist) return null;

      let videoId: string | null = null;

      if (host === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else {
        videoId = parsedUrl.searchParams.get("v");
      }

      if (videoId) {
        return {
          platform: "youtube",
          category: "video",
          id: videoId,
          url
        };
      }
    }

    if (host === "soundcloud.com") {
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

      if (pathParts.length === 3 && pathParts[1] === "sets") {
        return {
          platform: "soundcloud",
          category: "playlist",
          id: null,
          url: url
        };
      }

      if (pathParts.length >= 2) {
        return {
          platform: "soundcloud",
          category: "video",
          id: null,
          url: url
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
