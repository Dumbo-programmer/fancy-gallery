// Gallery script: fading image slideshow + looping video strip

const imageNames = [
  'images/1.jpg','images/2.jpg','images/3.jpg','images/4.jpg',
  'images/5.jpg','images/6.jpg','images/7.jpg','images/8.jpg',
  'images/9.png','images/10.png','images/11.jpeg', 'images/12.jpg'
];
const videoNames = ['videos/1.mp4','videos/2.mp4','videos/3.mp4','videos/4.mp4'];

const slideshowEl = document.getElementById('slideshow');
const videoStripTrack = document.getElementById('videoStrip');

// Preload images and keep only the ones that load successfully
async function preloadImage(src){
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function preloadVideo(src){
  return new Promise(resolve => {
    const v = document.createElement('video');
    v.onloadeddata = () => resolve(src);
    v.onerror = () => resolve(null);
    v.src = src;
    // do not call load() aggressively
  });
}

async function initGallery(){
  const imageChecks = await Promise.all(imageNames.map(preloadImage));
  const images = imageChecks.filter(Boolean);

  const videoChecks = await Promise.all(videoNames.map(preloadVideo));
  const videos = videoChecks.filter(Boolean);

  setupSlideshow(images);
  setupVideoStrip(videos);
}

// Slideshow
function setupSlideshow(images){
  if(!images.length){
    slideshowEl.innerHTML = '<div style="color:#999">No images found in /images</div>';
    return;
  }
  slideshowEl.innerHTML = '';
  images.forEach((src, i) =>{
    const img = document.createElement('img');
    img.src = src;
    img.alt = `slide-${i+1}`;
    if(i===0) img.classList.add('active');
    slideshowEl.appendChild(img);
  });

  let idx = 0;
  const slides = Array.from(slideshowEl.querySelectorAll('img'));
  const showNext = ()=>{
    slides[idx].classList.remove('active');
    idx = (idx+1)%slides.length;
    slides[idx].classList.add('active');
  };
  // fade interval
  setInterval(showNext, 1500);
}

// Video strip (carousel that loops, videos autoplay loop muted)
function setupVideoStrip(videos){
  if(!videos.length){
    videoStripTrack.innerHTML = '<div style="color:#999">No videos found in /videos</div>';
    return;
  }
  // Build original cards
  videoStripTrack.innerHTML = '';
  videos.forEach((src,i)=>{
    const card = document.createElement('div');
    card.className = 'video-card';
    const v = document.createElement('video');
    v.src = src;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.controls = false;
    card.appendChild(v);
    videoStripTrack.appendChild(card);
  });

  // Clone nodes to create an infinite seamless strip
  const originalCount = videoStripTrack.children.length;
  for(let i=0;i<originalCount;i++){
    const clone = videoStripTrack.children[i].cloneNode(true);
    // ensure cloned video elements keep playing
    const cv = clone.querySelector('video');
    if(cv){ cv.autoplay = true; cv.loop = true; cv.muted = true; cv.playsInline = true; }
    videoStripTrack.appendChild(clone);
  }

  const gap = 18; // must match CSS
  let cardWidth = videoStripTrack.children[0].getBoundingClientRect().width;
  let totalOriginalWidth = (cardWidth * originalCount) + (gap * (originalCount - 1));

  // continuous animation using translateX; move left continuously and reset when we've moved past original width
  let offset = 0;
  const speed = 0.6; // px per frame, increase for faster motion

  function step(){
    offset -= speed;
    if(Math.abs(offset) >= totalOriginalWidth){
      offset += totalOriginalWidth; // wrap seamlessly
    }
    videoStripTrack.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(step);
  }

  // start animation after layout
  function start(){
    // recalc sizes in case of responsive changes
    cardWidth = videoStripTrack.children[0].getBoundingClientRect().width;
    totalOriginalWidth = (cardWidth * originalCount) + (gap * (originalCount - 1));
    offset = 0;
    requestAnimationFrame(step);
  }

  start();

  // handle resize
  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      start();
    },150);
  });
}

initGallery();

// Local background audio using HTML5 Audio
let bgAudio = null;

window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('audioToggle');
  if(!btn) return;
  let enabled = false;

  const startBtn = document.getElementById('startBtn');
  const startModal = document.getElementById('startModal');
  if(startBtn){
    startBtn.addEventListener('click', ()=>{
      try{
        bgAudio = new Audio('audio.mp3');
        bgAudio.loop = true;
        bgAudio.volume = 0.6;
        bgAudio.play().catch(()=>{});
      }catch(e){}
      // start falling hearts
      try{ startHearts(); }catch(e){}
      // reveal audio toggle and remove modal
      if(btn) btn.style.display = 'block';
      if(startModal){
        startModal.style.transition = 'opacity .45s ease';
        startModal.style.opacity = '0';
        setTimeout(()=>{ startModal.remove(); }, 480);
      }
      if(btn) btn.textContent = '⏸';
      enabled = true;
    });
  }

  btn.addEventListener('click', ()=>{
    if(!bgAudio) return;
    if(enabled){
      try{ bgAudio.pause(); }catch(e){}
      btn.textContent = '🔊';
      enabled = false;
    } else {
      try{ bgAudio.play().catch(()=>{}); }catch(e){}
      btn.textContent = '⏸';
      enabled = true;
    }
  });
});

// Falling hearts
let heartInterval = null;
function startHearts(){
  const container = document.getElementById('heartFall');
  if(!container) return;
  // spawn hearts periodically
  if(heartInterval) clearInterval(heartInterval);
  heartInterval = setInterval(()=>{
    createHeart(container);
  }, 260);
}

function createHeart(container){
  const heart = document.createElement('div');
  heart.className = 'falling-heart';
  heart.innerText = '❤';
  const size = 8 + Math.random()*14; // base random size
  heart.style.fontSize = `${size + 10}px`;
  // spawn somewhere across the width (avoid extreme edges)
  const left = 6 + Math.random()*88; // percent
  heart.style.left = `${left}%`;
  const duration = 3200 + Math.random()*2200; // ms overall fall duration
  // horizontal sway amplitude (px)
  const sway = (8 + Math.random()*34) * (Math.random() > 0.5 ? 1 : -1);
  heart.style.setProperty('--sway', `${sway}px`);
  heart.style.animation = `fall ${duration}ms linear 0ms forwards`;
  container.appendChild(heart);
  // remove after animation ends
  setTimeout(()=>{ heart.remove(); }, duration + 600);
}

