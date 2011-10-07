function videoPlayer($elem, options) {
	var $this = this;

	this.settings = {autoOpen:true, autoPlay:true, autoClose:true, controlTimeout:3500, skip:function(){ $this.close(); }, close:function(){}, open:function(){}};
	$.extend(this.settings, options);

	this.opened = false;
	this.htimer = null;
	this.seeking = false;
	this.control = false;

	this.$elem = $elem.css('pointer-events','none');
	this.video = $elem.get(0);
	this.$play = $('<button class="video-player-play pause">');
	this.$time = $('<span class="video-player-timer">0.00</span>');
	this.$seek = $('<div class="video-player-seek" value="0" max="0"></div>');
	this.$fill = $('<div class="video-player-fill"></div>');
	this.$maxt = $('<span class="video-player-duration">0.00</span>');
	this.$ctrl = $('<div class="video-player-bar hide">');
	this.$knob = $('<a class="video-player-knob">');
	this.$skip = $('<a class="video-player-skip">');
	this.$skin = $('<div class="video-player">').width($elem.width()).height($elem.height()).append($elem).append($this.$ctrl.append($this.$play).append($this.$time).append($this.$seek).append($this.$maxt).append($this.$knob));
	this.$wrap = $('<div class="video-player-wrapper">').css('display','none').appendTo('body').append(this.$skin).append(this.$skip);

	this.$fill.appendTo(this.$seek);

	this.open = function(){
		$this.opened = true;
		$this.$wrap.stop(true,true).fadeIn(400, function(){ $this.settings.open(); });
		$this.showControls();
		if($this.settings.autoPlay) $this.play();
	};
	this.close = function(){
		$this.opened = false;
		$this.$wrap.stop(true,true).fadeOut(400, function(){ $this.settings.close(); });
		$this.hideControls();
		$this.pause();
	};

	this.play = function(){
		$this.video.play();
		$this.$play.removeClass('play').addClass('pause');
	};
	this.pause = function(){
		$this.video.pause();
		$this.$play.removeClass('pause').addClass('play');
	};
	this.toggle = function(){
		if($this.video.paused) $this.play();
		else $this.pause();
	};
	this.stop = function(){
		$this.pause();
		$this.$elem.attr('currentTime',0);
	};

	this.hideControls = function(){
		$this.control = false;
		$this.$ctrl.addClass('hide');
		$this.clearTimer();
	};
	this.showControls = function(){
		$this.control = true;
		$this.$ctrl.removeClass('hide');
		$this.resetTimer();
	};

	this.clearTimer = function(){
		clearTimeout($this.htimer);
	};
	this.resetTimer = function(){
		$this.clearTimer();
		$this.htimer = setTimeout($this.hideControls, $this.settings.controlTimeout);
	};
	this.formatTime = function(time) {
		var seconds = Math.floor(time % 60);
		var minutes = Math.floor(time / 60);
		return minutes+'.'+(seconds.toString().length == 1 ? '0' : '')+seconds;
	};
	this.rangeTime = function(time){
		time = parseFloat(time);
		var vduration = parseFloat($this.$elem.attr('duration'));
		if(time > vduration) time = vduration;
		else if(time < 0) time = 0;
		return time;
	};
	this.setSeek = function(time){
		time = $this.rangeTime(time);
		var vduration = parseFloat($this.$elem.attr('duration'));
		$this.$time.html($this.formatTime(time));
		$this.$seek.val(time);//.html(time / vduration);
		$this.$fill.width((time / vduration) * $this.$seek.width());
		$this.$knob.css('left',($this.$seek.offset().left - $this.$skin.offset().left) + ($this.$seek.width() * (time / vduration)) - ($this.$knob.width() / 2));
	};
	this.setTime = function(time){
		time = $this.rangeTime(time);
		if($this.seeking) $this.$elem.attr('currentTime',time);
		$this.setSeek(time);
	};
	this.setPosition = function(pageX) {
		$this.setTime(parseFloat((pageX - $this.$seek.offset().left) / $this.$seek.width()) * parseFloat($this.$elem.attr('duration')));
	};

	this.setOpt = function(opt,val){
		$this.settings[opt] = val;
		return $this;
	};

	// Things don't really start until the video is ready, i.e. video.readyState == true
	var createSeek = function(){
		if($this.$elem.attr('readyState')) {
			var updateTime = function(ev){
				if(!$this.seeking) {
					$this.setTime($this.$elem.attr('currentTime'));
					if($this.$elem.attr('currentTime') >= $this.$elem.attr('duration')) {
						$this.stop();
						if($this.settings.autoClose) $this.close();
					}
				}
			};
			$this.$seek.attr('max', $this.$elem.attr('duration'));
			$this.$maxt.html($this.formatTime($this.$elem.attr('duration')));
			$this.$elem.bind('timeupdate', updateTime);
			if($this.settings.autoOpen) $this.open();
			updateTime();
		}
		else {
			setTimeout(createSeek, 150);
		}
	};
	createSeek();

	// Center the player in the page
	this.$skin.offset({left:(this.$wrap.width() - $elem.width()) / 2, top:(this.$wrap.height() - $elem.height()) / 2});

	// Move the skip/close button to the very top right corner of the player
	var w = this.$skip.width(),
		n = (Math.sqrt(Math.pow(w, 2) + Math.pow(w, 2)) / 2) - (w / 2),
		o = Math.sqrt(Math.pow(n, 2) / 2);
	this.$skip.offset({left:(parseInt(this.$skin.css('left')) + this.$skin.width()) - o, top:parseInt(this.$skin.css('top')) - this.$skip.height() + o});

	// Set the seek bar to the proper width so that it fits between the time displays
	this.$seek.width((this.$skin.width() - this.$maxt.width() - parseInt(this.$maxt.css('margin-left')) - parseInt(this.$maxt.css('margin-right'))) - (this.$play.width() + parseInt(this.$play.css('margin-left')) + parseInt(this.$play.css('margin-right')) + this.$time.width() + parseInt(this.$seek.css('margin-left')) + parseInt(this.$seek.css('margin-right')) + parseInt(this.$time.css('margin-left')) + parseInt(this.$time.css('margin-right'))));

	// Mouse events
	this.$wrap.mousedown(function(){ $this.showControls(); });
	this.$skin.mousemove(function(){ $this.showControls(); });
	this.$play.mousedown(function(){ $this.toggle(); });
	this.$skip.mousedown(function(){ $this.settings.skip(); });
	this.$seek.mousedown(function(ev){ $this.setPosition(ev.pageX); });
	this.$knob.mousedown(function(ev){
		$this.seeking = true;
		$this.clearTimer();
		$this.pause();
		$this.$wrap.mousemove(function(ev){
			$this.setPosition(ev.pageX);
		});
		$this.$wrap.mouseup(function(ev){
			$this.seeking = false;
			$this.resetTimer();
			$this.$wrap.unbind('mouseup').unbind('mousemove');
			if($this.$elem.attr('currentTime') < $this.$elem.attr('duration')) $this.play();
			else {
				$this.stop();
				if($this.settings.autoClose) $this.close();
			}
		});
	});
}

function videoTrack($video, $track, options) {
	var self = this;

	self.settings = {on_load:null,on_loadfail:null,on_parse:null,$container:null};
	$.extend(this.settings, options);

	self.$wrap = $('<div class="track-wrapper hide">').appendTo((self.settings.$container !== null ? self.settings.$container : 'body'));
	self.$video = $video;
	self.$track = $track;
	self.loaded = false;
	self.parsed = false;
	self.track = {};
	self.active = null;

	// Takes a string formatted as [hh:]mm:ss.xxx and returns it as (int)milliseconds
	self.str2ms = function(str){
		var t = str.match(/^(?:([0-9]{2}):)?([0-9]{2}):([0-9]{2})\.([0-9]{3})$/);
		if(t === null) {
			return 0;
		}
		return ((((((t[1] !== undefined ? parseInt(t[1],10) : 0) * 60) + parseInt(t[2],10)) * 60) + parseInt(t[3],10)) * 1000) + parseInt(t[4],10);
	};

	// Takes a number of (int)seconds and returns (int)milliseconds
	self.sec2ms = function(sec){
		return Math.round(sec * 1000);
	};

	// the parsing loop function that iterates through the lines of a track file and dumps lines and times to an object
	self.parseLines = function(d){
		var t = 0,
			start = 0,
			end = 0;
		self.track = {};
		self.active = null;
		for(var i = 0; i < d.length; i++) {
			d[i] = d[i].replace('\r','').replace('\n','');
			if(t === 2) {
				if(/^$/.test(d[i]) !== true) {
					if(self.track[start] === undefined) {
						self.track[start] = {end:end,lines:[]};
					}
					self.track[start].lines.push(d[i]);
					self.$wrap.append('<p class="'+start.toString()+' hide">'+d[i]+'</p>');
				}
				else {
					t = 0;
				}
			}
			else {
				if(t === 1) {
					var l = d[i].match(/^((?:[0-9]{2}:)?[0-9]{2}:[0-9]{2}.[0-9]{3}) --> ((?:[0-9]{2}:)?[0-9]{2}:[0-9]{2}.[0-9]{3})$/);
					if(l === null) {
						t = 0;
					}
					else {
						t = 2;
						start = self.str2ms(l[1]);
						end = self.str2ms(l[2]);
					}
				}
				if(t === 0) {
					if(/^[0-9]+$/.test(d[i]) === true) {
						t = 1;
					}
				}
			}
		}
		self.parsed = true;
		if(self.settings.on_parse && typeof(self.settings.on_parse) === 'function') {
			self.settings.on_parse();
		}
	};

	// grabs the track file through XHR and sends it to the parsing function
	self.loadTrack = function(src){
		$.ajax(src,{dataType:'text',complete:function(data){
			self.loaded = true;
			self.parseLines(data.responseText.replace('\r','').split('\n'));
			if(self.settings.on_load && typeof(self.settings.on_load) === 'function') {
				self.settings.on_load();
			}
		}}).error(function(data){
			self.loaded = false;
			if(self.settings.on_loadfail && typeof(self.settings.on_loadfail) === 'function') {
				self.settings.on_loadfail();
			}
		});
	};

	// show the current track line (resize and reposition everytime just in case)
	self.show = function(k){
		var vos = self.$video.offset();
		self.$wrap.css('top',(vos.top+20+self.$video.height())+'px').css('left',vos.left+'px').removeClass('hide').find('p').addClass('hide').end().find('.'+k.toString()).removeClass('hide');
	};

	// hide the track
	self.hide = function(){
		self.$wrap.addClass('hide').find('p').addClass('hide');
	};

	// add a timeupdate event callback to the media to display tracks
	self.$video.bind('timeupdate',function(e){
		if(self.loaded === true || self.parsed === true) {
			var t = self.sec2ms(e.currentTarget.currentTime);
			for(var k in self.track) {
				k = parseInt(k,10);
				if(k > t || t > self.track[k].end) {
					continue;
				}
//				if(self.active !== k) {
					self.active = k;
					self.show(k);
//				}
				return;
			}
			self.hide();
		}
	});

	self.loadTrack(self.$track.attr('src'));
	self.$wrap.width(self.$video.width());
}