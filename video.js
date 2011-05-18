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
	this.$seek = $('<progress class="video-player-seek" value="0" max="0">0%</progress>');
	this.$maxt = $('<span class="video-player-duration">0.00</span>');
	this.$ctrl = $('<div class="video-player-bar hide">');
	this.$knob = $('<a class="video-player-knob">');
	this.$skip = $('<a class="video-player-skip">');
	this.$skin = $('<div class="video-player">').width($elem.width()).height($elem.height()).append($elem).append($this.$ctrl.append($this.$play).append($this.$time).append($this.$seek).append($this.$maxt).append($this.$knob));
	this.$wrap = $('<div class="video-player-wrapper">').css('display','none').appendTo('body').append(this.$skin).append(this.$skip);

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
		$this.$seek.val(time).html(time / vduration);
		$this.$knob.css('left',($this.$seek.offset().left - $this.$skin.offset().left) + ($this.$seek.width() * (time / vduration)) - ($this.$knob.width() / 2));
	};
	this.setTime = function(time){
		time = $this.rangeTime(time);
		$this.$elem.attr('currentTime',time);
		$this.setSeek(time);
	};
	this.setPosition = function(pageX) {
		$this.setTime(parseFloat((pageX - $this.$seek.offset().left) / $this.$seek.width()) * parseFloat($this.$elem.attr('duration')));
	};

	// Things don't really start until the video is ready, i.e. video.readyState == true
	var createSeek = function(){
		if($this.$elem.attr('readyState')) {
			var updateTime = function(ev){
				if(!$this.seeking) {
					$this.setSeek($this.$elem.attr('currentTime'));
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