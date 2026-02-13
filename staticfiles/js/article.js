// Dark Mode Toggle Functionality
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        updateDarkModeButton(false);
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        updateDarkModeButton(true);
    }
}

function updateDarkModeButton(isDark) {
    const buttonText = document.querySelector('.dark-mode-text');
    const sunMoonIcon = document.querySelector('.dark-mode-icon');
    
    if (isDark) {
        if (buttonText) buttonText.textContent = 'Light Mode';
        sunMoonIcon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        `;
    } else {
        if (buttonText) buttonText.textContent = 'Dark Mode';
        sunMoonIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        `;
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateDarkModeButton(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateDarkModeButton(false);
    }
}

// Full-screen image viewer with zoom and pan functionality
class FullscreenViewer {
    constructor() {
        this.viewer = null;
        this.container = null;
        this.media = null;
        this.closeBtn = null;
        this.downloadBtn = null;
        this.zoomIndicator = null;
        this.controls = null;
        
        this.scale = 1;
        this.minScale = 1;
        this.maxScale = 5;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.lastTouchDistance = 0;
        this.isPinching = false;
        
        this.init();
    }
    
    init() {
        // Add click handlers to all media elements
        this.setupMediaListeners();
        
        // Reinitialize when new content is loaded
        $(document).ajaxComplete(() => {
            setTimeout(() => this.setupMediaListeners(), 100);
        });
    }
    
    setupMediaListeners() {
        // Main posts
        const mediaElements = document.querySelectorAll('.media-image, .media-video, .profile-media-image, .profile-media-video');
        
        mediaElements.forEach(mediaElement => {
            mediaElement.removeEventListener('click', this.handleMediaClick.bind(this));
            mediaElement.addEventListener('click', this.handleMediaClick.bind(this));
            mediaElement.style.cursor = 'pointer';
        });
    }
    
    handleMediaClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.open(e.target);
    }
    
    open(mediaElement) {
        // Create full-screen overlay
        this.viewer = document.createElement('div');
        this.viewer.className = 'fullscreen-viewer';
        
        // Create container for transform
        this.container = document.createElement('div');
        this.container.className = 'fullscreen-media-container';
        
        // Create media element
        this.media = document.createElement(mediaElement.tagName);
        this.media.className = 'fullscreen-media';
        
        if (mediaElement.tagName === 'IMG') {
            this.media.src = mediaElement.src;
            this.media.alt = mediaElement.alt || 'Full screen image';
        } else if (mediaElement.tagName === 'VIDEO') {
            this.media.src = mediaElement.querySelector('source').src;
            this.media.controls = true;
            this.media.autoplay = true;
        }
        
        // Create close button
        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'viewer-close-btn';
        this.closeBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        
        // Create download button for images
        if (mediaElement.tagName === 'IMG') {
            this.downloadBtn = document.createElement('a');
            this.downloadBtn.className = 'viewer-download-btn';
            this.downloadBtn.href = mediaElement.src;
            this.downloadBtn.download = 'image.jpg';
            this.downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            `;
            this.downloadBtn.addEventListener('click', (e) => e.stopPropagation());
            this.viewer.appendChild(this.downloadBtn);
        }
        
        // Create zoom indicator
        this.zoomIndicator = document.createElement('div');
        this.zoomIndicator.className = 'zoom-indicator';
        this.zoomIndicator.textContent = '100%';
        
        // Create controls
        this.controls = document.createElement('div');
        this.controls.className = 'viewer-controls';
        this.controls.innerHTML = `
            <button class="viewer-control-btn" onclick="fullscreenViewer.zoomOut()" title="Zoom Out">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button class="viewer-control-btn" onclick="fullscreenViewer.resetZoom()" title="Reset Zoom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            </button>
            <button class="viewer-control-btn" onclick="fullscreenViewer.zoomIn()" title="Zoom In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        `;
        
        // Assemble the viewer
        this.container.appendChild(this.media);
        this.viewer.appendChild(this.closeBtn);
        this.viewer.appendChild(this.zoomIndicator);
        this.viewer.appendChild(this.controls);
        this.viewer.appendChild(this.container);
        document.body.appendChild(this.viewer);
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        
        // Reset transform
        this.resetTransform();
        
        // Activate with animation
        setTimeout(() => {
            this.viewer.classList.add('active');
        }, 10);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Close on escape key
        this.escapeListener = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', this.escapeListener);
            }
        };
        document.addEventListener('keydown', this.escapeListener);
    }
    
    setupEventListeners() {
        // Mouse events
        this.media.addEventListener('wheel', this.handleWheel.bind(this));
        this.media.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.viewer.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.viewer.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.viewer.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Touch events
        this.media.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.media.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.media.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Double click to zoom
        this.media.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // Close on background click
        this.viewer.addEventListener('click', (e) => {
            if (e.target === this.viewer) {
                this.close();
            }
        });
    }
    
    handleWheel(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom(this.scale + delta, e.clientX, e.clientY);
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.viewer.classList.add('grabbing');
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateTransform();
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.viewer.classList.remove('grabbing');
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch for panning
            this.isDragging = true;
            this.startX = e.touches[0].clientX - this.translateX;
            this.startY = e.touches[0].clientY - this.translateY;
        } else if (e.touches.length === 2) {
            // Two touches for pinch-to-zoom
            this.isPinching = true;
            this.isDragging = false;
            
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.lastTouchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            // Calculate center point
            const centerX = (touch1.clientX + touch2.clientX) / 1;
            const centerY = (touch1.clientY + touch2.clientY) / 1;
            this.pinchCenter = { x: centerX, y: centerY };
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (this.isDragging && e.touches.length === 1) {
            // Pan with single touch
            this.translateX = e.touches[0].clientX - this.startX;
            this.translateY = e.touches[0].clientY - this.startY;
            this.updateTransform();
        } else if (this.isPinching && e.touches.length === 2) {
            // Pinch-to-zoom with two touches
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (this.lastTouchDistance > 0) {
                const delta = (currentDistance - this.lastTouchDistance) * 0.01;
                const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
                
                // Calculate center point
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                
                // Zoom towards the center point
                const scaleChange = newScale / this.scale;
                this.translateX = centerX - (centerX - this.translateX) * scaleChange;
                this.translateY = centerY - (centerY - this.translateY) * scaleChange;
                this.scale = newScale;
                
                this.updateTransform();
            }
            
            this.lastTouchDistance = currentDistance;
        }
    }
    
    handleTouchEnd(e) {
        if (e.touches.length === 0) {
            this.isDragging = false;
            this.isPinching = false;
            this.lastTouchDistance = 0;
        } else if (e.touches.length === 1) {
            // Switch from pinch to pan
            this.isPinching = false;
            this.isDragging = true;
            this.startX = e.touches[0].clientX - this.translateX;
            this.startY = e.touches[0].clientY - this.translateY;
        }
    }
    
    handleDoubleClick(e) {
        e.preventDefault();
        if (this.scale > 1.5) {
            this.resetZoom();
        } else {
            this.zoom(2.5, e.clientX, e.clientY);
        }
    }
    
    zoom(newScale, centerX, centerY) {
        const oldScale = this.scale;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
        
        // Zoom towards the center point
        if (centerX !== undefined && centerY !== undefined) {
            const scaleChange = this.scale / oldScale;
            this.translateX = centerX - (centerX - this.translateX) * scaleChange;
            this.translateY = centerY - (centerY - this.translateY) * scaleChange;
        }
        
        this.updateTransform();
    }
    
    zoomIn() {
        this.zoom(this.scale + 0.1, window.innerWidth / 1, window.innerHeight / 1);
    }
    
    zoomOut() {
        this.zoom(this.scale - 0.5, window.innerWidth / 2, window.innerHeight / 2);
    }
    
    resetZoom() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
    
    resetTransform() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }
    
    updateTransform() {
        if (!this.container) return;
        
        this.container.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        
        // Update zoom indicator
        if (this.zoomIndicator) {
            const percentage = Math.round(this.scale * 100);
            this.zoomIndicator.textContent = `${percentage}%`;
            this.zoomIndicator.style.display = this.scale > 1.1 ? 'block' : 'none';
        }
    }
    
    close() {
        if (!this.viewer) return;
        
        this.viewer.classList.remove('active');
        setTimeout(() => {
            if (this.viewer && this.viewer.parentNode) {
                this.viewer.parentNode.removeChild(this.viewer);
            }
            document.body.style.overflow = '';
            
            // Clean up
            this.viewer = null;
            this.container = null;
            this.media = null;
            this.closeBtn = null;
            this.downloadBtn = null;
            this.zoomIndicator = null;
            this.controls = null;
        }, 300);
    }
}

// Initialize fullscreen viewer
let fullscreenViewer;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    fullscreenViewer = new FullscreenViewer();
    
    // Existing card hover effects
    const cards = document.querySelectorAll('.result-card');
    const hoverEffects = document.querySelectorAll('.card-hover-effect');
    
    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
            this.style.borderColor = '#c7d2fe';
            this.style.transform = 'translateY(-4px)';
            hoverEffects[index].style.opacity = '1';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
            this.style.borderColor = '#e2e8f0';
            this.style.transform = 'translateY(0)';
            hoverEffects[index].style.opacity = '0';
        });
    });
});

function toggleSidebar() {
    document.querySelector('.sidebar-nav').classList.toggle('active');
}

function toggleLike(postId) {
    event.preventDefault();
    event.stopPropagation();
    const likeBtn = event.target.closest('.heart-btn');
    likeBtn.classList.toggle('liked');
    likeBtn.style.transform = 'scale(1.1)';
    setTimeout(() => { likeBtn.style.transform = 'scale(1)'; }, 200);
    return false;
}

function toggleComments(postId) {
    event.preventDefault();
    event.stopPropagation();
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.classList.toggle('active');
    }
    return false;
}

const modal = document.getElementById('postModal');
const titleInput = document.getElementById('id_title');
const postInput = document.getElementById('id_post');
const titleCount = document.getElementById('titleCount');
const postCount = document.getElementById('postCount');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('postForm');

function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    titleInput.focus();
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
    titleCount.textContent = '0 / 250';
    postCount.textContent = '0 characters';
    validateForm();
}

function closeModalOnOverlay(event) {
    if (event.target === modal) {
        closeModal();
    }
}

titleInput.addEventListener('input', function() {
    const length = this.value.length;
    const maxLength = 250;
    titleCount.textContent = `${length} / ${maxLength}`;
    validateForm();
});

postInput.addEventListener('input', function() {
    const length = this.value.length;
    postCount.textContent = `${length} characters`;
    validateForm();
});

function validateForm() {
    const titleValid = titleInput.value.trim().length > 0;
    const postValid = postInput.value.trim().length > 0;
    submitBtn.disabled = !(titleValid && postValid);
}

validateForm();

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.textContent = 'Posting...';
    submitBtn.disabled = true;
    form.submit();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

function toggleReplyForm(button) {
    const commentActions = button.closest('.comment-actions');
    const replyForm = commentActions.nextElementSibling;
    if (button.textContent.trim() === 'Cancel') {
        replyForm.classList.remove('active');
        const replyButton = commentActions.querySelector('.action-btn:first-child');
        if (replyButton) replyButton.textContent = 'Reply';
    } else {
        replyForm.classList.toggle('active');
        if (replyForm.classList.contains('active')) {
            button.textContent = 'Cancel';
            const textarea = replyForm.querySelector('.reply-input');
            if (textarea) textarea.focus();
        } else {
            button.textContent = 'Reply';
        }
    }
}

const profileSidebar = document.getElementById('profileSidebar');
const profileBackdrop = document.getElementById('profileBackdrop');

function openProfile() {
    profileSidebar.classList.add('active');
    profileBackdrop.classList.add('active');
    if (window.innerWidth >= 768) {
        document.body.classList.add('profile-open');
    }
}

function closeProfile() {
    profileSidebar.classList.remove('active');
    profileBackdrop.classList.remove('active');
    document.body.classList.remove('profile-open');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && profileSidebar.classList.contains('active')) {
        closeProfile();
    }
});

$(document).ready(function() {
    $('.comment-form form').submit(function(e) {
        e.preventDefault();
        var form = $(this);
        var postId = form.find('input[name="post_id"]').val();
        var commentText = form.find('textarea[name="comment"]').val().trim();
        var csrfToken = form.find('input[name="csrfmiddlewaretoken"]').val();
        var commentBtn = form.find('.btn-add-comment');
        
        if (!commentText) {
            alert('Please write a comment');
            return;
        }
        
        commentBtn.text('Posting...');
        commentBtn.prop('disabled', true);
        
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: {
                'post_id': postId,
                'comment': commentText,
                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response) {
                form.find('textarea[name="comment"]').val('');
                var commentsList = form.closest('.comments-section').find('.comments-list');
                commentsList.find('.empty-comments').remove();
                
                var commentHtml = `
                    <div class="comment" id="comment-${response.comment_id || 'new'}">
                        <div class="comment-thread">
                            <div class="comment-thread-line"></div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <div class="comment-avatar">${response.user_initials || 'U'}</div>
                                    <span class="comment-username">${response.user_name || 'User'}</span>
                                    <span class="comment-handle">@${response.user_handle || 'user'}</span>
                                    <span class="comment-time">Just now</span>
                                </div>
                                <div class="comment-text">${commentText}</div>
                                <div class="comment-actions">
                                    <button class="action-btn" onclick="toggleReplyForm(this)">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        Reply
                                    </button>
                                    <button class="action-btn" onclick="deleteComment(this)">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                                <div class="reply-form">
                                    <form method="post" class="reply-form-ajax" data-comment-id="${response.comment_id || 'new'}">
                                        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                                        <textarea class="reply-input" placeholder="Write a reply..." name="reply" required></textarea>
                                        <button type="submit" class="btn-add-reply">Reply</button>
                                        <button type="button" class="action-btn" onclick="toggleReplyForm(this)">Cancel</button>
                                    </form>
                                </div>
                                <div class="replies-container" id="replies-${response.comment_id || 'new'}"></div>
                            </div>
                        </div>
                    </div>`;
                
                commentsList.prepend(commentHtml);
                showToast('Comment posted successfully!', '#00ba7c');
                // Reinitialize fullscreen viewer for new content
                fullscreenViewer.setupMediaListeners();
            },
            error: function() {
                alert('Error posting comment. Please try again.');
            },
            complete: function() {
                commentBtn.text('Comment');
                commentBtn.prop('disabled', false);
            }
        });
    });

    $(document).on('submit', '.reply-form-ajax', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var commentId = form.data('comment-id');
        var replyText = form.find('textarea[name="reply"]').val().trim();
        var csrfToken = form.find('input[name="csrfmiddlewaretoken"]').val();
        var replyBtn = form.find('.btn-add-reply');
        
        if (!replyText) {
            alert('Please write a reply');
            return;
        }
        
        replyBtn.text('Posting...');
        replyBtn.prop('disabled', true);
        
        $.ajax({
            type: 'POST',
            url: form.attr('action'),
            data: {
                'reply': replyText,
                'csrfmiddlewaretoken': csrfToken
            },
            success: function(response) {
                form.find('textarea[name="reply"]').val('');
                form.closest('.reply-form').removeClass('active');
                
                var repliesContainer = form.closest('.comment-content').find('.replies-container');
                if (repliesContainer.length === 0) {
                    repliesContainer = $(`<div class="replies-container" id="replies-${commentId}"></div>`);
                    form.closest('.comment-content').append(repliesContainer);
                }
                
                var replyHtml = `
                    <div class="comment reply" id="reply-${response.reply_id || 'new'}">
                        <div class="comment-thread">
                            <div class="comment-thread-line"></div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <div class="comment-avatar">${response.user_initials || 'U'}</div>
                                    <span class="comment-username">${response.user_name || 'User'}</span>
                                    <span class="comment-handle">@${response.user_handle || 'user'}</span>
                                    <span class="comment-time">Just now</span>
                                </div>
                                <div class="comment-text">${replyText}</div>
                                <div class="comment-actions">
                                    <button class="action-btn" onclick="deleteComment(this)">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
                
                repliesContainer.append(replyHtml);
                showToast('Reply posted successfully!', '#00ba7c');
            },
            error: function(xhr, status, error) {
                console.error('Reply error:', error);
                if (xhr.status === 403) {
                    showToast('CSRF token error. Please refresh the page.', '#f4212e');
                } else if (xhr.status === 404) {
                    showToast('Comment not found.', '#f4212e');
                } else {
                    showToast('Error posting reply. Please try again.', '#f4212e');
                }
            },
            complete: function() {
                replyBtn.text('Reply');
                replyBtn.prop('disabled', false);
            }
        });
    });
});

function showToast(message, color = '#1d9bf0') {
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    toast.style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: ${color}; color: white; padding: 10px 20px; border-radius: 50px; font-weight: 700; z-index: 10001; animation: fadeInOut 3s ease-in-out;`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function handleFileSelect(input, postId) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);
    formData.append('post_id', postId);

    const form = document.getElementById(`mediaForm-${postId}`);
    const action = form ? form.action : `/media/${postId}/`;
    const csrftoken = getCookie('csrftoken');

    fetch(action, {
        method: 'POST',
        credentials: "same-origin",
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        showLoading("Uploading...", 5);
        if (data.success) {
            showToast('✓ uploaded successfully!', '#00ba7c');
            setTimeout(() => {
                window.location.href = data.redirect_url;
            }, 1500);
        } else {
            hideLoading();
            console.error('Upload error:', data.error);
            showToast(data.error, '#f4212e'); 
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Unexpected error:', error);
        showToast('Unexpected error occurred. Try again.', '#f4212e');
    });
}

function deletePost(postId, url) {
    const isConfirmed = confirm("Are you sure you want to delete this post? This action cannot be undone.");
    if (!isConfirmed) return;
    const csrftoken = getCookie('csrftoken');
    const deleteBtn = event.target;
    const originalText = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 4px;"><div style="width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div> Deleting...</span>';
    deleteBtn.disabled = true;
    
    if (!document.querySelector('#delete-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'delete-spinner-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }
    
    fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Request failed with status: ' + response.status);
        return response.json();
    })
    .then(data => {
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;
        if (data.success) {
            const profilePost = document.getElementById('post-' + postId);
            const mainPost = document.getElementById('article-' + postId);
            if (profilePost) {
                profilePost.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                profilePost.style.opacity = '0';
                profilePost.style.transform = 'translateX(20px)';
                setTimeout(() => { profilePost.remove(); }, 300);
            }
            if (mainPost) {
                mainPost.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                mainPost.style.opacity = '0';
                mainPost.style.transform = 'translateX(-20px)';
                setTimeout(() => { mainPost.remove(); }, 300);
            }
            showToast('✓ Post deleted successfully!', '#00ba7c');
            setTimeout(() => {
                const remainingPosts = document.querySelectorAll('.profile-post, .post');
                if (remainingPosts.length === 0) showToast('All posts have been deleted', '#657786');
            }, 350);
        } else {
            console.error('Delete failed:', data.error);
            showToast('Failed to delete post: ' + (data.error || 'Unknown error'), '#f4212e');
        }
    })
    .catch(error => {
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;
        console.error('Delete error:', error);
        showToast('Error deleting post. Please try again.', '#f4212e');
    });
}

function deleteComment(commentId, url) {
    const comment = document.getElementById(`comment-${commentId}`);
    if (!comment) {
        console.warn(`Comment element #comment-${commentId} not found`);
        return;
    }

    const confirmed = confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    comment.classList.add('deleting'); 

    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then((response) => {
        if (!response.ok) throw new Error("Network failed");
        return response.json().catch(() => {
            throw new Error("Invalid JSON");
        });
    })
    .then((data) => {
        if (data.success) {
            comment.remove();
            showToast(data.message, "#00ba7c");
        } else {
            comment.classList.remove('deleting');
            showToast("Failed to delete comment", "#ff4d4d");
        }
    })
    .catch((err) => {
        console.error(err);
        comment.classList.remove('deleting');
        showToast("Error deleting comment", "#ff4d4d");
    });
}

function deleteReply(replyId, url) {
    const reply= document.getElementById(`reply-${replyId}`);
    if (!reply) {
        console.warn(`Reply element #reply-${replyId} not found`);
        return;
    }

    const confirmed = confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    reply.classList.add('deleting'); 

    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then((response) => {
        if (!response.ok) throw new Error("Network failed");
        return response.json().catch(() => {
            throw new Error("Invalid JSON");
        });
    })
    .then((data) => {
        if (data.success) {
            reply.remove();
            showToast(data.message, "#00ba7c");
        } else {
            reply.classList.remove('deleting');
            showToast("Failed to delete reply", "#ff4d4d");
        }
    })
    .catch((err) => {
        console.error(err);
        reply.classList.remove('deleting');
        showToast("Error deleting reply", "#ff4d4d");
    });
}

function showLoading(message, seconds = 2) {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message || 'Processing...';
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.display = 'none'; }, seconds * 1000);
    }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    });
});

document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar-nav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !mobileToggle.contains(e.target)) {
        toggleSidebar();
    }
});

$('.likebutton').click(function(e) {
    e.preventDefault();
    var postId = $(this).data("postid");
    var actionUrl = $(this).data("url");  
    var csrftoken = getCookie('csrftoken');

    $.ajax({
        type: "POST",
        url: actionUrl,
        data: { post_id: postId },
        headers: { "X-CSRFToken": csrftoken },
        success: function(data) {   
            if (data.success) {
                var countSpan = $('#like' + data.post_id).find('.like-count');
                countSpan.text(data.like_count);

                if (data.liked) {
                    $('#like' + data.post_id).addClass('liked');
                    showToast("Liked by " + data.username, "#00ba7c");
                } else {
                    $('#like' + data.post_id).removeClass('liked');
                    showToast("Unliked by " + data.username, "#f4212e");
                }
            } else {
                showToast(data.error, "#f4212e");
            }
        },
        error: function(xhr) {
            showToast("Error liking post", "#f4212e");
        }
    });
});

function hideLoading() {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}