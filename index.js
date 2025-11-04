import{S as R,i as u,a as I}from"./assets/vendor-DuFnt2m8.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=o(a);fetch(a.href,r)}})();const f=document.querySelector("#theme-toggle"),y=document.body;document.addEventListener("DOMContentLoaded",()=>{localStorage.getItem("theme")==="dark"?(y.classList.add("dark-mode"),f.checked=!0):(y.classList.remove("dark-mode"),f.checked=!1)});f.addEventListener("change",()=>{f.checked?(y.classList.add("dark-mode"),localStorage.setItem("theme","dark")):(y.classList.remove("dark-mode"),localStorage.setItem("theme","light"))});const L=document.querySelector("#search-form"),d=document.querySelector(".gallery"),S=document.querySelector(".loader"),E=document.querySelector(".loader-text"),k=document.querySelector(".load-more-btn"),w=document.querySelector("#search-categories"),N="32475203-0397f154fda8b2c2a6bae1f0a",$=40;let c=1,l="",p=0,m="https://pixabay.com/api/",n="all";const q=new R('.gallery a[data-type="image"]',{captionsData:"alt",captionDelay:250});L.addEventListener("submit",T);k.addEventListener("click",V);w.addEventListener("click",z);d.addEventListener("click",U);function U(e){const t=e.target.closest("a");if(t&&t.dataset.type==="video"){e.preventDefault();const o=t.dataset.videoSrc;j(o)}}function j(e){const t=`
    <div class="video-modal-overlay">
      <div class="video-modal-content">
        <button class="modal-close-btn">&times;</button>
        <video src="${e}" controls autoplay></video>
      </div>
    </div>
  `;document.body.insertAdjacentHTML("beforeend",t);const o=document.querySelector(".video-modal-overlay");o.querySelector(".modal-close-btn").addEventListener("click",b),o.addEventListener("click",i=>{i.target===o&&b()}),document.addEventListener("keydown",M)}function b(){const e=document.querySelector(".video-modal-overlay");e&&document.body.removeChild(e),document.removeEventListener("keydown",M)}function M(e){e.key==="Escape"&&b()}function z(e){e.preventDefault();const t=e.target;t.tagName==="BUTTON"&&(w.querySelectorAll(".category-btn").forEach(o=>{o.classList.remove("active")}),t.classList.add("active"),m=t.dataset.url,n=t.dataset.type,d.innerHTML="",g(),l=L.elements.searchQuery.value.trim(),l&&T(new Event("submit")))}async function T(e){e.preventDefault();const o=(e.currentTarget.tagName==="FORM"?e.currentTarget:L).elements.searchQuery.value.trim();if(!o){u.error({title:"Hata",message:"Arama kutusu boş olamaz!",position:"topRight"});return}l=o,c=1,d.innerHTML="",g(),O();try{const i=await C(l,c);p=i.totalHits,p===0?u.info({title:"Bilgi",message:"Sorry, there are no images matching your search query. Please try again!",position:"topRight"}):(B(i.hits),q.refresh(),H())}catch(i){P(i)}finally{x()}}async function V(){c+=1,g(),O();try{const e=await C(l,c);B(e.hits),q.refresh(),F(),H()}catch(e){P(e)}finally{x()}}async function C(e,t){const o={key:N,q:e,page:t,per_page:$,safesearch:"true"};return n==="video"?m="https://pixabay.com/api/videos/":(m="https://pixabay.com/api/",o.orientation="horizontal",n!=="all"&&(o.image_type=n)),(await I.get(m,{params:o})).data}function B(e){let t="";n==="video"?t=e.map(({videos:o,picture_id:i,tags:a,likes:r,views:s,comments:h,downloads:v})=>{const A=o.medium.url,D=`https://i.vimeocdn.com/video/${i}_640x360.jpg`;return`<li class="gallery-item">
            <a class="gallery-link" href="#" data-type="video" data-video-src="${A}">
              <img class="gallery-image" src="${D}" alt="${a}" loading="lazy"/>
            </a>
            <div class="info">
              <p class="info-item"><b>Likes</b> ${r}</p>
              <p class="info-item"><b>Views</b> ${s}</p>
              <p class="info-item"><b>Comments</b> ${h}</p>
              <p class="info-item"><b>Downloads</b> ${v}</p>
            </div>
          </li>`}).join(""):t=e.map(({webformatURL:o,largeImageURL:i,tags:a,likes:r,views:s,comments:h,downloads:v})=>`<li class="gallery-item">
            <a class="gallery-link" href="${i}" data-type="image">
              <img class="gallery-image" src="${o}" alt="${a}" loading="lazy"/>
            </a>
            <div class="info">
              <p class="info-item"><b>Likes</b> ${r}</p>
              <p class="info-item"><b>Views</b> ${s}</p>
              <p class="info-item"><b>Comments</b> ${h}</p>
              <p class="info-item"><b>Downloads</b> ${v}</p>
            </div>
          </li>`).join(""),d.insertAdjacentHTML("beforeend",t)}function O(){S.classList.remove("hidden"),E.classList.remove("hidden")}function x(){S.classList.add("hidden"),E.classList.add("hidden")}function _(){k.classList.remove("hidden")}function g(){k.classList.add("hidden")}function H(){c*$>=p?(g(),p>0&&u.info({title:"Bilgi",message:"We're sorry, but you've reached the end of search results.",position:"topRight"})):_()}function F(){const e=d.querySelector(".gallery-item");if(e){const t=e.getBoundingClientRect().height;window.scrollBy({top:t*2,behavior:"smooth"})}}function P(e){u.error({title:"Hata",message:`Bir hata oluştu: ${e.message}`,position:"topRight"}),console.error("Fetch Error:",e)}
//# sourceMappingURL=index.js.map
