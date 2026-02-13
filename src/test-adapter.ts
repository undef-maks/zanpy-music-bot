import { parseResourceUrl } from "./core/url-parser";
import { SoundcloudAdapter } from "adapters/sc.adapter";


const sc = new SoundcloudAdapter();
const parsed = parseResourceUrl("https://soundcloud.com/leonardo-patron-chavarria/sets/hyperbaiter");

console.log(parsed);
