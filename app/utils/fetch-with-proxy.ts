export function transformForProxy(url: string) {
	return `https://corsproxy.10jmellott.workers.dev?url=${encodeURIComponent(url)}`;
}

export default function fetchWithProxy(url: string, options?: RequestInit) {
	const proxyUrl = transformForProxy(url);
	return fetch(proxyUrl, options);
}
