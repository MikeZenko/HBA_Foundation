document.addEventListener('DOMContentLoaded', () => {
    // Admin credentials (in a real app, this would be handled server-side)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'hba2024'
    };

    // Clear any existing session storage - this fixes the login issue
    sessionStorage.removeItem('adminLoggedIn');

    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const adminTabs = document.getElementById('adminTabs');
    const pendingList = document.getElementById('pendingList');
    const approvedList = document.getElementById('approvedList');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const previewContent = document.getElementById('previewContent');
    const approveScholarship = document.getElementById('approveScholarship');
    const rejectScholarship = document.getElementById('rejectScholarship');
    const logoutButton = document.getElementById('logoutButton');

    let currentScholarship = null;

    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        loadContributions();
    }

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginSection.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            loadContributions();
        } else {
            alert('Invalid credentials');
        }
    });

    // Tab Switching
    adminTabs.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const tabId = e.target.dataset.tab;
            
            // Update tab styles
            adminTabs.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('border-[#3A5A40]', 'text-[#3A5A40]');
                btn.classList.add('border-transparent');
            });
            e.target.classList.add('border-[#3A5A40]', 'text-[#3A5A40]');
            e.target.classList.remove('border-transparent');

            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tabId}Contributions`).classList.remove('hidden');
        }
    });

    // Load Contributions
    async function loadContributions() {
        try {
            const response = await fetch('/api/contributions');
            if (!response.ok) {
                throw new Error('Failed to load contributions');
            }
            const data = await response.json();
            
            // Clear existing lists
            pendingList.innerHTML = '';
            approvedList.innerHTML = '';

            // Sort by timestamp (newest first)
            data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Populate lists
            data.forEach(contribution => {
                const card = createContributionCard(contribution);
                if (contribution.status === 'approved') {
                    approvedList.appendChild(card);
                } else {
                    pendingList.appendChild(card);
                }
            });
        } catch (error) {
            console.error('Error loading contributions:', error);
            alert('Error loading contributions. Please try again.');
        }
    }

    // Create Contribution Card
    function createContributionCard(contribution) {
        const card = document.createElement('div');
        card.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        
        const date = new Date(contribution.timestamp).toLocaleDateString();
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold text-[#3A5A40]">${contribution.scholarshipName}</h3>
                    <p class="text-sm text-gray-600">Submitted by ${contribution.submitterName} on ${date}</p>
                </div>
                <button class="view-details px-3 py-1 bg-[#3A5A40] text-white rounded hover:bg-[#2F4D35] transition-colors" data-id="${contribution.id}">
                    View Details
                </button>
            </div>
        `;

        // Add click handler for view details
        card.querySelector('.view-details').addEventListener('click', () => {
            showPreviewModal(contribution);
        });

        return card;
    }

    // Show Preview Modal
    function showPreviewModal(contribution) {
        currentScholarship = contribution;
        
        previewContent.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-700">Scholarship Name</h4>
                    <p>${contribution.scholarshipName}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Organization</h4>
                    <p>${contribution.organization}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Website</h4>
                    <p><a href="${contribution.website}" target="_blank" class="text-blue-600 hover:underline">${contribution.website}</a></p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Level of Study</h4>
                    <p>${contribution.level}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Host Country</h4>
                    <p>${contribution.hostCountry}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Target Group</h4>
                    <p>${contribution.targetGroup}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Deadline</h4>
                    <p>${contribution.deadline}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700">Funding Type</h4>
                    <p>${contribution.fundingType}</p>
                </div>
                <div class="col-span-2">
                    <h4 class="font-semibold text-gray-700">Funding Details</h4>
                    <p>${contribution.fundingDetails || 'Not specified'}</p>
                </div>
                <div class="col-span-2">
                    <h4 class="font-semibold text-gray-700">Eligibility Requirements</h4>
                    <p>${contribution.eligibility}</p>
                </div>
                <div class="col-span-2">
                    <h4 class="font-semibold text-gray-700">Application Process</h4>
                    <p>${contribution.applicationProcess}</p>
                </div>
                <div class="col-span-2">
                    <h4 class="font-semibold text-gray-700">Additional Notes</h4>
                    <p>${contribution.additionalNotes || 'None'}</p>
                </div>
                <div class="col-span-2">
                    <h4 class="font-semibold text-gray-700">Submitted By</h4>
                    <p>${contribution.submitterName} (${contribution.submitterEmail})</p>
                </div>
            </div>
        `;

        previewModal.classList.remove('hidden');
    }

    // Close Preview Modal
    closePreviewModal.addEventListener('click', () => {
        previewModal.classList.add('hidden');
        currentScholarship = null;
    });

    // Approve Scholarship
    approveScholarship.addEventListener('click', async () => {
        if (!currentScholarship) return;

        try {
            const response = await fetch('/api/approve-scholarship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: currentScholarship.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to approve scholarship');
            }

            const result = await response.json();
            if (result.success) {
                previewModal.classList.add('hidden');
                await loadContributions(); // Reload the lists
                alert('Scholarship approved and added to the explorer!');
            } else {
                throw new Error(result.error || 'Failed to approve scholarship');
            }
        } catch (error) {
            console.error('Error approving scholarship:', error);
            alert('Error approving scholarship. Please try again.');
        }
    });

    // Reject Scholarship
    rejectScholarship.addEventListener('click', async () => {
        if (!currentScholarship) return;

        try {
            const response = await fetch('/api/reject-scholarship', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: currentScholarship.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject scholarship');
            }

            const result = await response.json();
            if (result.success) {
                previewModal.classList.add('hidden');
                await loadContributions(); // Reload the lists
                alert('Scholarship rejected');
            } else {
                throw new Error(result.error || 'Failed to reject scholarship');
            }
        } catch (error) {
            console.error('Error rejecting scholarship:', error);
            alert('Error rejecting scholarship. Please try again.');
        }
    });

    // Logout handler
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        loginSection.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
    });
}); 