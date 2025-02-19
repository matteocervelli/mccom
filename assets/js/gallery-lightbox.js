let currentGalleryIndex = 0;
let allImages = [];
const galleryImages = JSON.parse(document.getElementById('gallery-lightbox').dataset.gallery);

document.addEventListener('DOMContentLoaded', function() {
    // Collect all content images
    const contentImages = document.querySelectorAll('.project-main img');
    contentImages.forEach(img => {
        // Add lightbox trigger class and data attributes
        img.classList.add('lightbox-trigger');
        img.dataset.action = 'open';
        img.dataset.caption = img.alt || '';
        
        // Wrap image in a container for better styling
        const wrapper = document.createElement('div');
        wrapper.className = 'content-image-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
    });

    // Update allImages array with both content and gallery images
    allImages = [...contentImages, ...document.querySelectorAll('.gallery-item img')].map(img => ({
        src: img.src,
        alt: img.alt,
        caption: img.dataset.caption
    }));

    // Handle all image clicks
    document.querySelectorAll('[data-action="open"]').forEach((img, index) => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            openGalleryLightbox(this, allImages.findIndex(image => image.src === this.src));
        });
    });

    // Handle thumbnail clicks
    document.querySelectorAll('[data-action="jump"]').forEach(thumb => {
        thumb.addEventListener('click', function(e) {
            jumpToImage(parseInt(this.dataset.index));
        });
    });
});

function openGalleryLightbox(img, index) {
    event.stopPropagation();
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxDescription = lightbox.querySelector('.lightbox-description');
    
    currentGalleryIndex = index;
    updateLightboxImage();
    
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    highlightCurrentThumbnail();
}

function closeGalleryLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function changeGalleryImage(direction) {
    event.stopPropagation();
    currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
    highlightCurrentThumbnail();
}

function jumpToImage(index) {
    event.stopPropagation();
    currentGalleryIndex = index;
    updateLightboxImage();
    highlightCurrentThumbnail();
}

function updateLightboxImage() {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-content img');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxDescription = lightbox.querySelector('.lightbox-description');
    
    const currentImage = allImages[currentGalleryIndex];
    lightboxImg.src = currentImage.src;
    lightboxTitle.textContent = currentImage.alt;
    lightboxDescription.textContent = currentImage.caption;
}

function highlightCurrentThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentGalleryIndex);
    });
}

// Handle keyboard navigation
document.addEventListener('keydown', function(e) {
    if (document.getElementById('gallery-lightbox').style.display === 'flex') {
        if (e.key === 'Escape') closeGalleryLightbox();
        if (e.key === 'ArrowLeft') changeGalleryImage(-1);
        if (e.key === 'ArrowRight') changeGalleryImage(1);
    }
}); 