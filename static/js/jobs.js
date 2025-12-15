document.addEventListener('DOMContentLoaded', function () {
    loadJobs();

    // Post Job Form
    const postJobForm = document.getElementById('post-job-form');
    if (postJobForm) {
        postJobForm.onsubmit = async function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/freelance/jobs/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    this.reset();
                    loadJobs();
                }
            } catch (error) {
                console.error('Error posting job:', error);
            }
        }
    }

    // Bid Modal
    const bidModal = document.getElementById('bid-modal');
    const bidForm = document.getElementById('bid-form');

    if (bidForm) {
        bidForm.onsubmit = async function (e) {
            e.preventDefault();
            console.log('Submitting bid...');
            const formData = new FormData(this);
            const jobId = formData.get('job_id');

            if (!jobId) {
                console.error('No Job ID found in form');
                return;
            }

            try {
                const response = await fetch(`/api/freelance/jobs/${jobId}/bid/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                if (response.ok) {
                    bidModal.style.display = 'none';
                    this.reset();
                    alert('Bid submitted successfully!');
                    loadJobs(); // Refresh the list to show the new bid count if applicable
                } else {
                    const err = await response.json();
                    console.error('Bid submission failed:', err);
                    alert('Error submitting bid: ' + JSON.stringify(err));
                }
            } catch (error) {
                console.error('Error submitting bid:', error);
                alert('An error occurred. Please try again.');
            }
        }
    }
    // Modal closing logic is now handled in common.js
});

async function loadJobs() {
    try {
        const response = await fetch('/api/freelance/jobs/');
        const jobs = await response.json();

        const clientGrid = document.getElementById('client-jobs-grid');
        const pwdGrid = document.getElementById('pwd-jobs-grid');

        if (clientGrid) {
            clientGrid.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <div class="job-header">
                        <h3>${job.title}</h3>
                        <span class="status ${job.status}">${job.status}</span>
                    </div>
                    <p>${job.description}</p>
                    <div class="job-meta">
                        <span>Amount: KES ${job.amount}</span>
                        <span>Timeframe: ${job.timeframe}</span>
                    </div>
                    <div class="job-actions">
                        ${job.status === 'open' ? `
                            <button onclick="closeJob(${job.id})" class="btn-secondary">Close Job</button>
                        ` : ''}
                    </div>
                    ${job.bids.length > 0 ? `
                        <div class="bids-list">
                            <h4>Bids (${job.bids.length})</h4>
                            ${job.bids.map(bid => `
                                <div class="bid-item">
                                    <div class="bid-header">
                                        <span>${bid.freelancer.username}</span>
                                        <button onclick="startChat('${bid.freelancer.username}')"><i class="fas fa-comment"></i></button>
                                    </div>
                                    <p>${bid.proposal}</p>
                                    <small>Amount: ${bid.amount} | Time: ${bid.timeframe}</small>
                                    <a href="${bid.resume}" target="_blank">View Resume</a>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No bids yet</p>'}
                </div>
            `).join('');
        }

        if (pwdGrid) {
            pwdGrid.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p class="client-name">Posted by: ${job.client.username}</p>
                    <p>${job.description}</p>
                    <div class="job-meta">
                        <span>Amount: KES ${job.amount}</span>
                        <span>Timeframe: ${job.timeframe}</span>
                    </div>
                    <button onclick="openBidModal(${job.id})" class="btn-primary">Submit Bid</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

async function closeJob(jobId) {
    if (!confirm('Are you sure you want to close this job?')) return;

    try {
        const response = await fetch(`/api/freelance/jobs/${jobId}/close/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (response.ok) loadJobs();
    } catch (error) {
        console.error('Error closing job:', error);
    }
}

window.openBidModal = function (jobId) {
    console.log('Opening bid modal for job:', jobId);
    const idInput = document.getElementById('bid-job-id');
    const modal = document.getElementById('bid-modal');

    if (idInput && modal) {
        idInput.value = jobId;
        modal.style.display = 'block';
    } else {
        console.error('Bid modal elements not found');
    }
}

async function startChat(username) {
    try {
        const response = await fetch('/api/chat/conversations/start/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            document.getElementById('chat-bubble').click();
        }
    } catch (error) {
        console.error('Error starting chat:', error);
    }
}
