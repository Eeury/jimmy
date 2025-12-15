document.addEventListener('DOMContentLoaded', function () {
    loadPosts();

    // Post Input Expansion
    // Post Input Expansion context
    const inputArea = document.getElementById('post-input-area');
    const expandedArea = document.getElementById('post-expanded');
    const mediaInput = document.getElementById('post-media');
    const mediaPreview = document.getElementById('media-preview');
    const postContent = document.getElementById('post-content');
    const submitBtn = document.getElementById('submit-post');

    function updateSubmitButton() {
        if (postContent.value.trim().length > 0 || mediaInput.files.length > 0) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'true');
        }
    }

    inputArea.onclick = function () {
        this.style.display = 'none';
        expandedArea.style.display = 'block';
        postContent.focus();
    }

    postContent.addEventListener('input', updateSubmitButton);

    // Click outside to collapse
    document.addEventListener('click', function (event) {
        if (!inputArea.contains(event.target) && !expandedArea.contains(event.target)) {
            if (postContent.value === '' && mediaInput.files.length === 0) {
                expandedArea.style.display = 'none';
                inputArea.style.display = 'flex';
            }
        }
    });

    // Media Preview
    mediaInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let mediaHtml = '';
                if (file.type.startsWith('image')) {
                    mediaHtml = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 8px;">`;
                } else if (file.type.startsWith('video')) {
                    mediaHtml = `<video src="${e.target.result}" controls style="max-width: 100%; border-radius: 8px;"></video>`;
                }

                // Add delete button
                const wrapper = document.createElement('div');
                wrapper.innerHTML = `
                    <div style="position: relative; display: inline-block;">
                        ${mediaHtml}
                        <button type="button" class="remove-media-btn" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

                mediaPreview.innerHTML = '';
                mediaPreview.appendChild(wrapper);

                // Attach delete handler
                wrapper.querySelector('.remove-media-btn').onclick = function () {
                    mediaInput.value = ''; // Clear file input
                    mediaPreview.innerHTML = ''; // Clear preview
                    updateSubmitButton(); // Re-check button state
                };
            }
            reader.readAsDataURL(file);
        }
        updateSubmitButton();
    }

    // Submit Post
    submitBtn.onclick = async function () {
        const content = postContent.value;
        const file = mediaInput.files[0];

        if (!content && !file) return;

        const formData = new FormData();
        formData.append('content', content);
        if (file) {
            if (file.type.startsWith('image')) {
                formData.append('image', file);
            } else {
                formData.append('video', file);
            }
        }

        try {
            submitBtn.disabled = true; // Prevent double submit
            submitBtn.textContent = 'Posting...';

            const response = await fetch('/api/tubonge/posts/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData
            });

            if (response.ok) {
                postContent.value = '';
                mediaPreview.innerHTML = '';
                mediaInput.value = '';
                expandedArea.style.display = 'none';
                inputArea.style.display = 'flex';
                loadPosts();
            } else {
                alert('Failed to post. Please try again.');
            }
        } catch (error) {
            console.error('Error posting:', error);
            alert('Error posting. Please check your connection.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Post';
            updateSubmitButton();
        }
    }
});

async function loadPosts() {
    try {
        const response = await fetch('/api/tubonge/posts/');
        const posts = await response.json();
        const feed = document.getElementById('posts-feed');
        feed.innerHTML = '';

        posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post-card';
            postEl.innerHTML = `
                <div class="post-header">
                    <div class="header-info">
                        <span class="username">${post.author.username}</span>
                        <span class="timestamp">${new Date(post.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.image ? `<div class="post-media-container"><img src="${post.image}" class="post-media"></div>` : ''}
                ${post.video ? `<div class="post-media-container"><video src="${post.video}" controls class="post-media"></video></div>` : ''}
                
                <div class="post-stats">
                    ${post.total_likes > 0 ? `<span class="likes-count"><i class="fas fa-thumbs-up"></i> ${post.total_likes}</span>` : ''}
                </div>

                <div class="post-actions-bar">
                    <button onclick="likePost(${post.id})" class="action-btn ${post.is_liked ? 'liked' : ''}">
                        <i class="far fa-thumbs-up"></i> Like
                    </button>
                    <button onclick="toggleComments(${post.id})" class="action-btn">
                        <i class="far fa-comment-alt"></i> Comment
                    </button>
                </div>

                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list">
                        ${post.comments.map(c => `
                            <div class="comment">
                                <img src="/static/images/default-avatar.png" alt="User" class="comment-avatar">
                                <div class="comment-bubble">
                                    <div class="comment-author">${c.author.username}</div>
                                    <div class="comment-text">${c.content}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="comment-input-wrapper">

                        <div class="comment-input-box">
                            <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}" onkeypress="handleCommentEnter(event, ${post.id})">
                            <button onclick="submitComment(${post.id})"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            `;
            feed.appendChild(postEl);

            // Add handler for modal close if it doesn't exist yet
            const closeBtn = document.getElementById('close-post-modal');
            if (closeBtn) {
                closeBtn.onclick = function () {
                    document.getElementById('post-expanded').style.display = 'none';
                    document.getElementById('post-input-area').style.display = 'flex';
                }
            }
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

async function likePost(postId) {
    try {
        const response = await fetch(`/api/tubonge/posts/${postId}/like/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (response.ok) loadPosts();
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

function toggleComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

async function submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value;
    if (!content) return;

    try {
        const response = await fetch(`/api/tubonge/posts/${postId}/comment/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ content })
        });
        if (response.ok) loadPosts();
    } catch (error) {
        console.error('Error commenting:', error);
    }
}
