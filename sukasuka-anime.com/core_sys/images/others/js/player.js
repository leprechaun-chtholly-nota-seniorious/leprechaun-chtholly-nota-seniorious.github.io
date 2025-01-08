/***************************************************************
* Youtubeプレイヤー Version 1.5.0
 * Copyright (C) 2012-2016 maverica corporation. All Rights Reserved.
 *
 * ※swfobject.jsを先に読み込んでおいてください。
 * ※play_list.jsとは同時に利用できません。
 * ※同一動画を複数、同一ページ内で利用することはできません。
 ***************************************************************/
var YPlayer = function() {
	this.paramList = {
		 'target': ''		//表示先タグID
		,'videoID': ''		//動画ID
		,'nextUrl' : ''		//再生終了後遷移先URL（IE6/IE7では動作しません）
		,'callback': null	//再生終了後実行関数（nextUrlが優先）（IE6/IE7では動作しません）
		,'isUseUserControl': false	//ユーザーコントローラーの利用
		,'isAutoPlay': false	//対応ブラウザでは自動再生(iOSでは無効)
		,'isUseControl': false	//コントロールの利用
		,'autoHide': 0			//コントロールの自動非表示（2:プログレスバーのみ非表示、1:自動非表示、0:常に表示）
		,'player': {		//プレーヤー設定
			 'width': 160
			,'height': 97
			,'quality': 'default'	//small:640x360未満/medium:640x360以上/large:854x480以上/hd720:1280x720以上/default:YouTube が適切な再生画質を選択
			,'fs': 1	//全画面表示ボタン 0:非表示/1:表示
		}
		,'startVolume': 100	//初期音量
	};
	this.player = null;
	this.activeIndex = 0;
	this.controlList = new Array();
	this.preVolume = 100;
};
YPlayer._ObjList = new Array();
YPlayer._playListFuncList = new Array();
YPlayer._isUseIframe = (function() {
	if(typeof document.documentElement.style.maxHeight != "undefined") {
		if(!/*@cc_on!@*/false) {
			//IE以外
			if(!!window.postMessage) {
				return true;
			} else {
				return false;
			}
		} else if(document.documentMode && document.documentMode >=8) {
			return true;
		} else {
			return false;
		}
	} else {
		//IE6以下
		return false;
	}
}());
YPlayer._isApple = (function() {
	var ua = navigator.userAgent;
	if(ua.indexOf("iPhone") > -1
	|| ua.indexOf("iPad") > -1) {
		return true;
	} else {
		return false;
	}
}());
YPlayer._isAndroid = (function() {
	var ua = navigator.userAgent;
	if(ua.indexOf("Android") > -1) {
		return true;
	} else {
		return false;
	}
}());
YPlayer.prototype = {
	 onPlayerReady:function(e) {
		 this.player.setPlaybackQuality(this.paramList["player"]["quality"]);
		 this.player.unMute();
		 this.player.setVolume(this.paramList["startVolume"]);

		if(this.paramList["isUseUserControl"]) {
			if(!YPlayer._isApple) {
				if(!YPlayer._isAndroid
				|| this.player.cueVideoByFlashvars) {
					this.controlList["mute"].parentNode.style.display = "";
					this.controlList["volume"].parentNode.style.display = "";
					this.controlList["time"].parentNode.style.display = "";
				}
			}
			this.controlList["controller"].style.display = "";

			if(!YPlayer._isApple) {
				if(!YPlayer._isAndroid
				|| this.player.cueVideoByFlashvars) {
					var baseWidth = parseInt(this.controlList["volume"].clientWidth);
					var width = Math.round(this.paramList["startVolume"] * baseWidth / 100);
					this.controlList["volume"].firstChild.style.width = width+"px";
				}
			}
		}
	}
	,onPlayerStateChange:function(state) {
		switch(state) {
			case 0: //YT.PlayerState.ENDED:
				if((this.player.getDuration() - 2) < this.player.getCurrentTime()
				|| this.player.getVideoBytesTotal() <= this.player.getVideoBytesLoaded()) {
					if(this.paramList["nextUrl"] && this.paramList["nextUrl"] != "") {
						document.location = this.paramList["nextUrl"];
					} else if(this.paramList["callback"] && 'function' === typeof this.paramList["callback"]) {
						this.paramList["callback"]();
					}
				}
				this.setPlayButton();

				break;
			case 1: //YT.PlayerState.PLAYING:
				this.setPauseButton();
				var myObj = this;
				setTimeout(function() {
					myObj.dispTime();
				}, 100);
				break;
			case 2: //YT.PlayerState.PAUSED:
				this.setPlayButton();
				break;
			case 5: //YT.PlayerState.CUED:
				var myObj = this;
				setTimeout(function() {
					myObj.dispTime();
				}, 10);
		}
	}
	,setPlayButton:function() {
		if(this.paramList["isUseUserControl"]) {
			if(!YPlayer._isApple) {
				var playButton = this.controlList["play"];
				playButton.setAttribute("title", "Play");
				playButton.setAttribute("class", "play");
				playButton.setAttribute("className", "play");	//IE
				playButton.innerHTML = '<span class="inner">Play</span>';
				this.controlList["time"].innerHTML = "";
			}
		}
	}
	,setPauseButton:function() {
		if(this.paramList["isUseUserControl"]) {
			if(!YPlayer._isApple) {
				var playButton = this.controlList["play"];
				playButton.setAttribute("title", "Pause");
				playButton.setAttribute("class", "pause");
				playButton.setAttribute("className", "pause");	//IE
				playButton.innerHTML = '<span class="inner">Pause</span>';
			}
		}
	}
	,dispTime:function() {
		if(this.paramList["isUseUserControl"]) {
			if(!YPlayer._isApple) {
				if(this.player
				&& this.controlList["time"].parentNode.style.display == "") {
					var totalTime = this.player.getDuration();
					var nowTime = this.player.getCurrentTime();
					if(this.player.getPlayerState() == 1/*YT.PlayerState.PLAYING*/) {
						if(nowTime && totalTime > 0 && nowTime > 0) {
							this.controlList["time"].innerHTML = this._getTimeStr(Math.floor(nowTime))+"/"+this._getTimeStr(Math.ceil(totalTime));
						} else {
							this.controlList["time"].innerHTML = "";
						}

						var ms = 10;
						if(nowTime > 0) {
							ms = (Math.ceil(nowTime) - nowTime) * 1000;
						}
						var myObj = this;
						setTimeout(function() {
							myObj.dispTime();
						}, ms);
					} else {
						this.controlList["time"].innerHTML = "";
					}
				} else {
					this.controlList["time"].innerHTML = "";
				}
			}
		}
	}
	,_getTimeStr:function(time) {
		var minute = Math.floor(time / 60);
		var sec = time % 60;
		return minute+":"+(("0" + sec).slice(-2));
	}
};
YPlayer.setPlayer = function(paramList) {
	var obj = new YPlayer();
	obj.paramList["target"] = paramList["target"];
	obj.paramList["videoID"] = paramList["videoID"];
	if(paramList["nextUrl"]) {
		obj.paramList["nextUrl"] = paramList["nextUrl"];
	}
	if(paramList["callback"]) {
		obj.paramList["callback"] = paramList["callback"];
	}
	if(paramList["isUseUserControl"]) {
		obj.paramList["isUseUserControl"] = paramList["isUseUserControl"];
	}
	if(paramList["isUseControl"]) {
		obj.paramList["isUseControl"] = paramList["isUseControl"];
	}
	if(paramList["isAutoPlay"]) {
		obj.paramList["isAutoPlay"] = paramList["isAutoPlay"];
	}
	if(paramList["autoHide"]) {
		obj.paramList["autoHide"] = paramList["autoHide"];
	}
	if(paramList["player"]) {
		if(paramList["player"]["width"]) {
			obj.paramList["player"]["width"] = paramList["player"]["width"];
		}
		if(paramList["player"]["height"]) {
			obj.paramList["player"]["height"] = paramList["player"]["height"];
		}
		if(paramList["player"]["quality"]) {
			obj.paramList["player"]["quality"] = paramList["player"]["quality"];
		}
		if(paramList["player"]["fs"]) {
			obj.paramList["player"]["fs"] = paramList["player"]["fs"];
		}
	}

	if("startVolume" in paramList) {
		obj.paramList["startVolume"] = paramList["startVolume"];
	}

	YPlayer._ObjList[paramList["videoID"]] = obj;

	var targetObj = document.getElementById(obj.paramList["target"]);
	if(!targetObj
	|| paramList["videoID"] == "") {
		alert("Setting Error!!");
		return;
	}

	if(typeof swfobject != "object") {
		alert("SWFObject(swfobject.js) is not found.");
		return;
	}

	if(obj.paramList["isUseUserControl"]) {
		//コントローラー/リストエリア描画
		var controlTagObj = document.createElement('div');
		if(targetObj.parentNode.lastChild === targetObj) {
			targetObj.parentNode.appendChild(controlTagObj);
		} else {
			targetObj.parentNode.insertBefore(controlTagObj, targetObj.nextSibling);
		}
		controlTagObj.setAttribute("id", obj.paramList["target"]+"_controller");

		if(!YPlayer._isApple) {
			var ulObj = document.createElement("ul");
			ulObj.style.display = "none";
			controlTagObj.appendChild(ulObj);
			obj.controlList["controller"] = ulObj;

			var liObj = document.createElement("li");
			liObj.setAttribute("class", "stop_area");
			liObj.setAttribute("className", "stop_area");	//IE
			ulObj.appendChild(liObj);
			var aObj = document.createElement("a");
			aObj.setAttribute("title", "Stop");
			aObj.setAttribute("href", "javascript:void(0)");
			aObj.setAttribute("class", "stop");
			aObj.setAttribute("className", "stop");	//IE
			aObj.onclick = function() {
				if(!obj.player) {
					return;
				}

				obj.player.seekTo(0, true);
				obj.player.stopVideo();

				obj.setPlayButton();
			};
			liObj.appendChild(aObj);
			var spanObj = document.createElement("span");
			spanObj.appendChild(document.createTextNode("Stop"));
			spanObj.setAttribute("class", "inner");
			spanObj.setAttribute("className", "inner");	//IE
			aObj.appendChild(spanObj);

			var liObj = document.createElement("li");
			liObj.setAttribute("class", "play_area");
			liObj.setAttribute("className", "play_area");	//IE
			ulObj.appendChild(liObj);
			var aObj = document.createElement("a");
			aObj.setAttribute("title", "Play");
			aObj.setAttribute("href", "javascript:void(0)");
			aObj.setAttribute("class", "play");
			aObj.setAttribute("className", "play");	//IE
			aObj.onclick = function() {
				if(!obj.player) {
					return;
				}
				if(obj.player.getPlayerState() == 1) {
					obj.setPlayButton();

					obj.player.pauseVideo();
				} else {
					obj.setPauseButton();

					obj.player.playVideo();
				}
			};
			liObj.appendChild(aObj);
			var spanObj = document.createElement("span");
			spanObj.appendChild(document.createTextNode("Play"));
			spanObj.setAttribute("class", "inner");
			spanObj.setAttribute("className", "inner");	//IE
			aObj.appendChild(spanObj);
			obj.controlList["play"] = aObj;

			if(!YPlayer._isApple) {
				var liObj = document.createElement("li");
				liObj.setAttribute("class", "mute_area");
				liObj.setAttribute("className", "mute_area");	//IE
				liObj.style.display = "none";
				ulObj.appendChild(liObj);
				var aObj = document.createElement("a");
				aObj.setAttribute("title", "Mute");
				aObj.setAttribute("href", "javascript:void(0)");
				aObj.setAttribute("class", "mute_off");
				aObj.setAttribute("className", "mute_off");	//IE
				aObj.onclick = function() {
					if(!obj.player) {
						return;
					}
					var baseWidth = parseInt(obj.controlList["volume"].clientWidth);
					var width = 0;
					if(obj.player.isMuted()) {
						obj.player.unMute();
						this.setAttribute("class", "mute_off");
						this.setAttribute("className", "mute_off");	//IE
						this.parentNode.setAttribute("class", "");
						this.parentNode.setAttribute("className", "");	//IE
						width = Math.round(obj.preVolume * baseWidth / 100);
					} else {
						obj.preVolume = obj.player.getVolume();
						obj.player.mute();
						this.setAttribute("class", "mute_on");
						this.setAttribute("className", "mute_on");	//IE
						this.parentNode.setAttribute("class", "active");
						this.parentNode.setAttribute("className", "active");	//IE
					}
					obj.controlList["volume"].firstChild.style.width = width+"px";
				};
				liObj.appendChild(aObj);
				var spanObj = document.createElement("span");
				spanObj.appendChild(document.createTextNode("Mute"));
				spanObj.setAttribute("class", "inner");
				spanObj.setAttribute("className", "inner");	//IE
				aObj.appendChild(spanObj);
				obj.controlList["mute"] = aObj;

				var liObj = document.createElement("li");
				liObj.style.display = "none";
				liObj.setAttribute("class", "volume_area");
				liObj.setAttribute("className", "volume_area");	//IE
				ulObj.appendChild(liObj);
				var divObj = document.createElement("div");
				divObj.setAttribute("class", "volume");
				divObj.setAttribute("className", "volume");	//IE
				divObj.setAttribute("title", "Volume");
				divObj.onmousedown = function(e) {
					if(!obj.player) {
						return;
					}
					var posX = 0;
					if(e) {
						posX = e.pageX;
					} else {
						posX = event.x+document.body.scrollLeft;
					}
					var width = parseInt(this.clientWidth);
					var magnification = 100 / width;
					if(!e) {
						e = window.event;
					}
					var x = posX - this.getBoundingClientRect().left - (document.body.scrollLeft || document.documentElement.scrollLeft);
					if(x > 100) {
						x = 100;
					} else if(x < 0) {
						x = 0;
					}
					this.firstChild.style.width = x+"px";
					obj.player.setVolume(Math.round(x * magnification));
					obj.controlList["mute"].setAttribute("class", "mute_off");
					obj.controlList["mute"].setAttribute("className", "mute_off");	//IE
					obj.controlList["mute"].parentNode.setAttribute("class", "");
					obj.controlList["mute"].parentNode.setAttribute("className", "");	//IE
				};
				liObj.appendChild(divObj);
				var div2Obj = document.createElement("div");
				div2Obj.setAttribute("class", "now_volume");
				div2Obj.setAttribute("className", "now_volume");	//IE
				divObj.appendChild(div2Obj);
				obj.controlList["volume"] = divObj;
			}

			var liObj = document.createElement("li");
			liObj.style.display = "none";
			liObj.setAttribute("class", "time_area");
			liObj.setAttribute("className", "time_area");	//IE
			ulObj.appendChild(liObj);
			var divObj = document.createElement("div");
			divObj.setAttribute("class", "time");
			divObj.setAttribute("className", "time");	//IE
			liObj.appendChild(divObj);
			obj.controlList["time"] = divObj;
		}
	}
};
YPlayer.create = function() {
	var keyTop = null;
	for(keyTop in YPlayer._ObjList) {
		break;
	}
	if(keyTop) {
		if(YPlayer._isUseIframe) {
			var targetTop = document.getElementById(YPlayer._ObjList[keyTop].paramList["target"]);
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			targetTop.parentNode.insertBefore(tag, targetTop);
		} else {
			for(var key in YPlayer._ObjList) {
				var obj = YPlayer._ObjList[key];
				var videoUrl = "https://www.youtube.com/v/"+obj.paramList['videoID']+"?enablejsapi=1&version=3"
					+ "&playerapiid="+obj.paramList["videoID"]
					+ "&rel=0&showsearch=0&showinfo=0&fs="+obj.paramList["player"]["fs"]+"&controls="+(obj.paramList["isUseControl"]?'1':'0')
					+ "&autoplay="+(!YPlayer._isApple&&obj.paramList["isAutoPlay"]?'1':'0')
					+ "&autohide="+obj.paramList["autoHide"]
				;
				var params = { allowScriptAccess: "always" };
				var atts = { id: "p_"+obj.paramList["videoID"] };
				swfobject.embedSWF(videoUrl
					,obj.paramList["target"]
					,obj.paramList["player"]["width"]
					,obj.paramList["player"]["height"]
					,"8" ,null ,null ,params ,atts
				);
			}
		}
	}
};
YPlayer.playVideo = function(videoId) {
	try {
		if(YPlayer._ObjList[videoId]
		&& YPlayer._ObjList[videoId].player) {
			YPlayer._ObjList[videoId].setPauseButton();
			YPlayer._ObjList[videoId].player.playVideo();
		}
	} catch(e) {
		return;
	}
};
YPlayer.stopVideo = function(videoId) {
	try {
		if(YPlayer._ObjList[videoId]
		&& YPlayer._ObjList[videoId].player) {
			YPlayer._ObjList[videoId].setPlayButton();
			YPlayer._ObjList[videoId].player.seekTo(0, true);
			YPlayer._ObjList[videoId].player.stopVideo();
			YPlayer._ObjList[videoId].player.pauseVideo();
		}
	} catch(e) {
		return;
	}

};
YPlayer.pauseVideo = function(videoId) {
	try {
		if(YPlayer._ObjList[videoId]
		&& YPlayer._ObjList[videoId].player) {
			YPlayer._ObjList[videoId].setPlayButton();
			YPlayer._ObjList[videoId].player.pauseVideo();
		}
	} catch(e) {
		return;
	}
};
YPlayer.changeVideoId = function(defaultVideoId, newVideoID) {
	if(YPlayer._ObjList[defaultVideoId]
	&& YPlayer._ObjList[defaultVideoId].player) {
		YPlayer._ObjList[defaultVideoId].setPlayButton();
		YPlayer._ObjList[defaultVideoId].player.cueVideoById(newVideoID, 0, YPlayer._ObjList[defaultVideoId].paramList["player"]["quality"]);
	}
}
YPlayer.changeVideoIdAndStart = function(defaultVideoId, newVideoID) {
	if(YPlayer._ObjList[defaultVideoId]
	&& YPlayer._ObjList[defaultVideoId].player) {
		YPlayer._ObjList[defaultVideoId].setPauseButton();
		YPlayer._ObjList[defaultVideoId].player.loadVideoById(newVideoID, 0, YPlayer._ObjList[defaultVideoId].paramList["player"]["quality"]);
	}
}
function onYouTubeIframeAPIReady() {
	for(var key in YPlayer._ObjList) {
		var obj = YPlayer._ObjList[key];
		eval('obj.player = new YT.Player("'+obj.paramList["target"]+'", {'
			+'	 height: "'+obj.paramList["player"]["height"]+'"'
			+'	,width: "'+obj.paramList["player"]["width"]+'"'
			+'	,videoId : "'+obj.paramList["videoID"]+'"'
			+'	,playerVars : {'
			+'		 rel: 0'
			+'		,showsearch: 0'
			+'		,showinfo: 0'
			+'		,fs: '+obj.paramList["player"]["fs"]
			+'		,controls: '+((YPlayer._isApple||obj.paramList["isUseControl"])?'1':'0')
			+'		,wmode: "transparent"'
			+'		,autoplay: '+(!YPlayer._isApple&&obj.paramList["isAutoPlay"]?'1':'0')
			+'		,autohide: '+obj.paramList["autoHide"]
			+'	}'
			+'	,events: {'
			+'		 "onReady": function(e) {YPlayer._ObjList["'+key+'"].onPlayerReady(e);}'
			+'		,"onStateChange": function(e) {YPlayer._ObjList["'+key+'"].onPlayerStateChange(e.data);}'
			+'	}'
			+'});'
		);
	}
}
function onYouTubePlayerReady(playerid) {
	var obj = document.getElementById("p_"+playerid);
	YPlayer._ObjList[playerid].player = obj;
	var callback = 'YPlayer._ObjList["'+playerid+'"].onPlayerStateChange';
	obj.addEventListener("onStateChange", callback);

	var myObj = YPlayer._ObjList[playerid];
	myObj.controlList["mute"].parentNode.style.display = "";
	myObj.controlList["volume"].parentNode.style.display = "";
	myObj.controlList["time"].parentNode.style.display = "";
	myObj.controlList["controller"].style.display = "";
}
