document.addEventListener('DOMContentLoaded', function() {
    if (typeof fullscreenViewer === 'undefined') {
        if (typeof FullscreenViewer !== 'undefined') {
            window.fullscreenViewer = new FullscreenViewer();
            fullscreenViewer = window.fullscreenViewer;
        }
    }
    
    setTimeout(function() {
        const mediaElements = document.querySelectorAll('.media-image, .media-video');
        mediaElements.forEach(media => {
            media.style.cursor = 'pointer';
            
            const newMedia = media.cloneNode(true);
            media.parentNode.replaceChild(newMedia, media);
            newMedia.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (fullscreenViewer && typeof fullscreenViewer.open === 'function') {
                    fullscreenViewer.open(this);
                } else if (window.fullscreenViewer && typeof window.fullscreenViewer.open === 'function') {
                    window.fullscreenViewer.open(this);
                } else {
                    openSimpleFullscreen(this);
                }
            });
            
            if (newMedia.tagName === 'VIDEO') {
                newMedia.addEventListener('click', function(e) {
                    if (e.target.classList.contains('media-video')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (fullscreenViewer && typeof fullscreenViewer.open === 'function') {
                            fullscreenViewer.open(this);
                        } else if (window.fullscreenViewer && typeof window.fullscreenViewer.open === 'function') {
                            window.fullscreenViewer.open(this);
                        }
                    }
                });
            }
        });
    }, 300);
});

function openSimpleFullscreen(mediaElement) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.5);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 10000;
    `;
    
    const fullscreenMedia = document.createElement(mediaElement.tagName);
    if (mediaElement.tagName === 'IMG') {
        fullscreenMedia.src = mediaElement.src;
        fullscreenMedia.style.maxWidth = '90%';
        fullscreenMedia.style.maxHeight = '90%';
        fullscreenMedia.style.objectFit = 'contain';
    } else if (mediaElement.tagName === 'VIDEO') {
        fullscreenMedia.src = mediaElement.src || mediaElement.querySelector('source')?.src;
        fullscreenMedia.controls = true;
        fullscreenMedia.autoplay = true;
        fullscreenMedia.style.maxWidth = '90%';
        fullscreenMedia.style.maxHeight = '90%';
    }
    
    const closeFullscreen = () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
    };
    
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeFullscreen();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeFullscreen();
        }
    };
    
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    };
    
    overlay.appendChild(closeBtn);
    overlay.appendChild(fullscreenMedia);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
}

if (typeof FullscreenViewer !== 'undefined' && typeof fullscreenViewer === 'undefined') {
    setTimeout(() => {
        window.fullscreenViewer = new FullscreenViewer();
    }, 500);
}