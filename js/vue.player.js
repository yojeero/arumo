
/*  Track Time jQuery */
$(document).ready(function(){$(".xl-icon").click(function(){$(".live-time").slideToggle();$(".online").slideToggle()})});

/*  Cover Spin  */
function spin(){var a=document.getElementById("spinner");"running"===a.style.webkitAnimationPlayState?(a.style.webkitAnimationPlayState="paused",document.body.className="paused"):(a.style.webkitAnimationPlayState="running",document.body.className="")};

/*  Vue City Player  */
new Vue({
  el: "#app",
  data() {
    return {
      audio: null,      
      barWidth: null,     
      currentTime: null,
      isTimerPlaying: false,
      tracks: [
        {
          name: "CITY23",
          artist: "Premium Pop",
          cover: "img/train.webp",
          source: "https://live.stream.maxfive.com/max5-city23/stream/mp3",
          url: "https://www.city23.at/"
        },  
        {
          name: "AN. MAINZ",
          artist: "Best Hits",
          cover: "img/sport.webp",
          source: "http://addrad.io/44556v5",
          url: "https://www.antenne-mainz.de"
        },
        {
          name: "MARETIMO",
          artist: "Lounge",
          cover: "img/decor.webp",
          source: "https://s35.derstream.net/lounge.mp3",
          url: "https://www.maretimo-records.com/en"
        },      
        {
          name: "CITY23          ",
          artist: "Beat,Baby!",
          cover: "img/japan.webp",
          source: "https://live.stream.maxfive.com/max5-beat/stream/mp3",
          url: "https://www.city23.at/"
        },   
        {
          name: "AN. BAYERN",
          artist: "Luxury Pop",
          cover: "img/italy.webp",
          source: "http://stream.antenne.de/pop-xxl/stream/mp3",
          url: "https://www.antenne.de/webradio/"
        }
      ],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null
    };
  },  
 methods: {
play: function() {
    this.audio.paused ? (this.audio.play(), this.isTimerPlaying = !0) : (this.audio.pause(), this.isTimerPlaying = !1)
},
generateTime: function() {
    this.barWidth = this.audio.currentTime + "%";
    var a = Math.floor(this.audio.currentTime / 60),
        b = Math.floor(this.audio.currentTime - 60 * a);
    10 > a && (a = "0" + a);
    10 > b && (b = "0" + b);
    this.currentTime = a + ":" + b
},
updateBar: function(a) {
    var b = this.$refs.progress;
    a = 100 * (a - b.offsetLeft) / b.offsetWidth;
    100 < a && (a = 100);
    0 > a && (a = 0);
    this.barWidth = a + "%";
    this.audio.play()
},
clickProgress: function(a) {
    this.isTimerPlaying = !0;
    this.audio.pause();
    this.updateBar(a.pageX)
},
prevTrack: function() {
    this.transitionName = "scale-in";
    this.isShowCover = !1;
    0 < this.currentTrackIndex ? this.currentTrackIndex-- : this.currentTrackIndex = this.tracks.length - 1;
    this.currentTrack = this.tracks[this.currentTrackIndex];
    this.resetPlayer()
},
nextTrack: function() {
    this.transitionName = "scale-out";
    this.isShowCover = !1;
    this.currentTrackIndex < this.tracks.length - 1 ? this.currentTrackIndex++ : this.currentTrackIndex = 0;
    this.currentTrack = this.tracks[this.currentTrackIndex];
    this.resetPlayer()
},
resetPlayer: function() {
    var a = this;
    this.barWidth = 0;
    this.audio.currentTime =
        0;
    this.audio.src = this.currentTrack.source;
    setTimeout(function() {
        a.isTimerPlaying ? a.audio.play() : a.audio.pause()
    }, 300)
},
}, 
created: function() {
var a = this;
this.currentTrack = this.tracks[0];
this.audio = new Audio;
this.audio.src = this.currentTrack.source;
this.audio.ontimeupdate = function() {
    a.generateTime()
};
this.audio.onloadedmetadata = function() {
    a.generateTime()
};
this.audio.onended = function() {
    a.nextTrack();
    this.isTimerPlaying = !0
};
for (var b = 0; b < this.tracks.length; b++) {
    var d = this.tracks[b],
        c = document.createElement("link");
    c.rel = "prefetch";
    c.href = d.cover;
    c.as = "image";
    document.head.appendChild(c)
}
}
});