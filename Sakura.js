const Sakura = function(token, callback) {
	this.wst = null;
	this.ws = null;
	
	let skr = this;
	this.wst = setInterval(function() {
//		console.log(token, skr.ws)
		if (skr.ws && (skr.ws.readyState == WebSocket.OPEN || skr.ws.readyState == WebSocket.CONNECTING)) {
			return
		}

		try {
			skr.ws = new WebSocket("wss://api.sakura.io/ws/v1/" + token)
			skr.ws.onopen = function() {
				if (skr.onopen) {
						skr.onopen();
				}
				skr.ws.onmessage = function(e) {
					console.log(e.data)
					const data = JSON.parse(e.data)
					const type = data.type
					if (type === "keepalive") {
						return;
					}
					if (type === "channels") {
						const id = data.module;
						const val = data.payload.channels[0].value
						callback(id, val)
					}
				};
				skr.ws.onclose = function() {
					this.ws = null;
					if (skr.onclose) {
						skr.onclose();
					}
				}
				skr.ws.onerror = function(event) {
					skr.ws = null
					if (skr.onerror) {
						skr.onerror(event);
					}
				}
			};
		} catch (e) {
			// can't catch!? WebSocket connection to 'wss://api.sakura.io/ws/v1/ failed: Error in connection establishment: net::ERR_INTERNET_DISCONNECTED
			console.log("can't connect " + e);
		}
	}, 500)

	this.send = function(moduleval, val) {
		const obj = {
			module: moduleval,
			type: 'channels',
			payload: { channels: [{ channel: 0, type: 'I', value: Number(val) }] }
		};
		this.ws.send(JSON.stringify(obj));
	}
};

export { Sakura };
