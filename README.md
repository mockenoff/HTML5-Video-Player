HTML5 Video Player Plugin v0.6
==============================

**This is a video player plugin that applies a more pleasing aesthetic to a browser's default HTML5 video player.**

Just include `video.css`, `video.js`, and the latest version of jQuery (1.6.4 at the moment) and call with

	var video = new videoPlayer($('#id-of-video-element'), {options});

Your &lt;video&gt; element must have its *width* and *height* attributes specified.

## Options

* autoOpen:boolean - set to *true* for the player to open as soon as the video is ready, *false* to open on your own time
* autoPlay:boolean - set to *true* for the video to start playing as soon as the player is opened, *false* to require the user to click play to play
* autoClose:boolean - set to *true* for the player to close when the video finishes, *false* to remain open
* controlTimeout:int - time in milliseconds for the player's controls to hide themselves from the user
* skip:function - callback function for when the user clicks the skip/close button
* close:function - callback function for when the player is closed
* open:function - callback function for when the player is opened

## Methods

* open() - opens the player
* close() - closes the player
* play() - starts or resumes play of the video
* pause() - pauses the video
* toggle() - switches between playing and paused states of the video
* stop() - stops the video
* showControls() - bubbles up the controls
* hideControls() - hides the controls
* setTime(time:float) - skips to the time specified (in seconds)

## Known Issues

It currently only works in **Webkit** browsers (since that was the only browser I needed it to work in at the time).

* There's a gap that appears under the controls when it slides down to hide
* Isn't implemented as a jQuery plugin, which it probably should be since it depends on jQuery

## Changelog

* Switched out the &lt;progress&gt; element for a &lt;div&gt;-based shim (10/7/2011)
* Fixed the quick-seek bug (10/7/2011)

HTML5 Video Text Track Plugin v0.2
==================================

**This is a VTT shim that is designed to work alongside the HTML5 video player plugin.**

I decided to lump this into my player plugin. It's very basic and just a first-time attempt at fill my need for video captions while adhering to WHATWG spec for web applications 1.0 (http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#webvtt).

Just include `video.css`, `video.js`, and the latest version of jQuery (1.6.4 at the moment) and call with

	var track = new videoTrack($(jQueryObjectOfTheVideo), $(jQueryObjectOfTheTrack), {options});

While it was designed mainly to be used with videos (hence using the VTT, or video text tracks, format), it could just as easily be used to caption audio elements.

## Options

* $container:jQuery - a jQuery object of the element you want the track to be displayed in
* on_load:function - callback function for when the track has finished downloading
* on_loadfail:function - callback function for when the track fails to download
* on_parse:function - callback function for when the track finishes parsing and is ready for display

## Methods

* str2ms(str:string) - converts a VTT time string formatted as [hh:]mm:ss.xxx and returns it in (int)milliseconds
* sec2ms(sec:int) - takes a number of seconds and returns it as (int)milliseconds
* parseLines(d:array) - turns an array of lines from a VTT file into an object relating finishing times and corresponding tracks to a start time
* loadTrack(src:string) - downloads the VTT file through XHR and passes it to the parsing function
* show(k:int) - takes a time and displays any relevant track text
* hide() - hides the track display

## Known Issues

As I said before, this is a preliminary attempt at making this and currently fulfills my only need, which is to display captions below a video. I'll eventually make it more robust and more compliant to the spec. The parse currrently only accepts segments of the following format:

	WEBVTT FILE

	[0-9]+
	[hh:]mm:ss.xxx --> [hh:]mm:ss.xxx
	Followed by as many lines as you so desire
	With as much <strong>HTML</strong> tags for formatting or what have you as you want

* As demonstrated above, there is no i18n, positioning, alignment, chapters, or paint-on support (for more information, check out http://html5videoguide.net/presentations/WebVTT/)
* As implied from above, the VTT rendering is also not up to spec. It pretty much just puts white text with some black text shadow out into the containing element right now.
* The current data structure I've created and implemented does not support multiple track chunks that overlap times. This is a fairly easy fix if things work out the way I think they will work out, so hopefully that will be fixed soon.

## Integrate with the Video Plugin

It's fairly easy to get these two plugins to work together since they're largely independent from one another. All you have to do is create a new video instance, a new track instance with the video wrapper specified as the track's container, and voila! Done!

	var v = $(jQueryObjectOfTheVideo),
		t = v.find('track'),
		video = new videoPlayer(v);
	video.track = new videoTrack(v,t,{$container:video.$wrap});

It's not even necessary to put the videoTrack instance within the videoPlayer instance; I just like to do that because it makes them seem more chummy together.