function FindProxyForURL(url, host) {
	if (dnsDomainIs(host, ".tencent.com") || dnsDomainIs(host, ".ddns.net"))
		return "PROXY localhost:8080";
	return "DIRECT";
}