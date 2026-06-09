function startMedia(source) {
  var video = document.querySelector('.movie-video');
  var overlay = document.querySelector('.play-overlay');
  var loaded = false;

  function activate() {
    if (!video || loaded) {
      return;
    }
    loaded = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', activate);
  }
  if (video) {
    video.addEventListener('click', activate, { once: true });
  }
}
