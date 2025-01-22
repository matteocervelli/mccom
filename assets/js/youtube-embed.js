document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('.content');
    if (!content) return;

    const youtubeRegex = /@https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g;
    
    content.innerHTML = content.innerHTML.replace(youtubeRegex, function(match, videoId) {
        return `<div class="youtube-container">
            <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen>
            </iframe>
        </div>`;
    });
}); 