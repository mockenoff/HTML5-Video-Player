HTML5 Video Player Plugin v0.5
==============================

**This is a video player plugin that applies a more pleasing aesthetic to a browser's default HTML5 video player.**

Just include `video.css`, `video.js`, and the latest version of jQuery (1.5.2 at the moment) and call with

	var video = new videoPlayer($('#id-of-video-element'), {options});

Your <video> element must have its *width* and *height* attributes specified.

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
* Sliding too quickly and immediately releasing the handle will result in the video jumping back to the original pre-slide time
* There's no way to style <progress> elements in non-Webkit browsers, so that will have to be replaced for this to be used in other browsers
* Isn't implemented as a jQuery plugin, which it probably should be since it depends on jQuery