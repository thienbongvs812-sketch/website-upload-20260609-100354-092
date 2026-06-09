(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-button');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-line-url]'));
    var hls = null;

    function playUrl(url, autoplay) {
      if (!video || !url) {
        return;
      }

      if (hls) {
        hls.destroy();
        hls = null;
      }

      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-line-url') === url);
      });

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (autoplay) {
            video.play().catch(function () {});
          }
        });
      } else {
        video.src = url;
        if (autoplay) {
          video.play().catch(function () {});
        }
      }

      player.classList.add('is-active');
      video.setAttribute('controls', 'controls');
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playUrl(video.getAttribute('data-video'), true);
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      playUrl(video.getAttribute('data-video'), true);
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var url = tab.getAttribute('data-line-url');
        video.setAttribute('data-video', url);
        playUrl(url, true);
      });
    });
  });
})();
