function FindProxyForURL(url, host) {
	if (dnsDomainIs(host, ".tencent.com"))
		return "PROXY localhost:8080";
	return "DIRECT";
}