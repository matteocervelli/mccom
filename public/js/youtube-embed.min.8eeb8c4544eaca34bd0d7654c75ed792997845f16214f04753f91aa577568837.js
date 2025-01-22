document.addEventListener("DOMContentLoaded",function(){const e=document.querySelector(".content");if(!e)return;const t=/@https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;e.innerHTML=e.innerHTML.replace(t,function(e,t){return`<div class="youtube-container">
            <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/${t}" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen>
            </iframe>
        </div>`})})