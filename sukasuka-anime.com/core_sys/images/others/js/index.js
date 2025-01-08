var videoId = 'ZGfC2boki-I';	//Youtube再生対象ビデオID
var intervalDay = -1;			//自動再生間隔日数（0で常に再生/-1で常に自動非再生）
$(function() {
	$("#skip_button,#op_area").on("click", function() {
		showMain();
	});

	$("#play_button,#play_button2").on("click", function() {
		if(YPlayer._ObjList[videoId]
		&& YPlayer._ObjList[videoId].player) {
			$("#skip_button").show();
			$("#op_area").show();
			$("#top_contents").hide();

			YPlayer._ObjList[videoId].player.seekTo(0, true);
			YPlayer._ObjList[videoId].player.playVideo();
		}else{
			openingMovie();
			$("#skip_button").show();
			$("#op_area").show();
			$("#top_contents").hide();
		}
	});

	function openingMovie() {
		playerObj = YPlayer.setPlayer({
			 'target': 'op_movie_area'
			,'videoID': videoId
			,'isUseControl': true
			,'isAutoPlay': true
			,'callback': showMain
			,'autoHide': 1			//コントロールの自動非表示（2:プログレスバーのみ非表示、1:自動非表示、0:常に表示）
			,'player': {
				 'width': 960
				,'height': 540
				,'quality': 'default'
			}
		,'startVolume': 30	//初期音量
		});
		YPlayer.create();
		$("#op_area").show();
	}

	function showMain() {
		YPlayer.stopVideo(videoId);
		$("#skip_button").hide();
		$("#op_area").fadeOut(500);
		$("#top_contents").show();
	}

	function onMovie() {
		$("#loading").fadeOut(1000);
		$("#top_contents").hide();

		var ref = document.referrer;
		var domain = location.hostname;
		if(ref != ""
		&& ref != "http://"+domain && ref != "http://"+domain+"/" && ref != "http://"+domain+"/index.html"
		&& ref != "https://"+domain && ref != "https://"+domain+"/" && ref != "https://"+domain+"/index.html"
		&& (ref.indexOf("http://"+domain)===0 || ref.indexOf("https://"+domain)===0)
		) {
			showMain();
		} else {
			var saveVideoId = getMyCookie('save_video');
			var lastPlayDate = Number(getMyCookie('last_play_date'));
			if(isNaN(lastPlayDate)) {
				lastPlayDate = 0;
			}

			var now = new Date();
			var nowValue = now.getFullYear()*1000+(now.getMonth()+1)*100+now.getDate();

			if(YPlayer._isUseIframe
			&& intervalDay >= 0
			&& (lastPlayDate+intervalDay <= nowValue || saveVideoId !== videoId)) {
				var noMovieList = [
					 'Android', 'iPhone', 'iPad', 'iPod', 'KDDI', 'UP.Browser', 'DoCoMo', 'FOMA'
					,'J-PHONE', 'Vodafone', 'SoftBank', 'NetFront'
					,'DDIPOCKET', 'WILLCOM', 'Mobile', 'Phone', 'BlackBerry', 'SymbianOS'
//					,'FireFox'
				];
				var noMovieRegObj = new RegExp(noMovieList.join('|'), 'i');
//				if(noMovieRegObj.test(navigator.userAgent)) {
				if(false) {
					showMain();
				} else {
					setMyCookie('save_video', videoId);
					setMyCookie('last_play_date', nowValue);

					openingMovie();
				}
			} else {
				showMain();
			}
		}

	}

	$(window).on("load", function() {
		onMovie();
	});

	function getMyCookie(inkey) {
		key=inkey+"=";
		tmp = document.cookie;
		pos = tmp.indexOf(key);
		if(pos == -1) {
			return null;
		} else {
			sepPos = tmp.indexOf(";", pos + key.length);
			return unescape(tmp.substring(pos + key.length, sepPos));
		}
	}

	function setMyCookie(key, val) {
		date = new Date();
		date.setTime(date.getTime()+1000*60*60*24*365);
		document.cookie=key+"="+escape(val)+"; expires=" + date.toGMTString();
	}
});