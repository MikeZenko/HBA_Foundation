document.addEventListener('DOMContentLoaded', async () => {

    // Initialize the sections
    initializeSections();

    // Fetch scholarship data from API
    let scholarshipData = [];
    
    try {
        const response = await fetch('/api/scholarships');
        if (response.ok) {
            scholarshipData = await response.json();
            console.log('Successfully loaded', scholarshipData.length, 'scholarships from API');
        } else {
            console.error('Failed to fetch scholarships:', response.status);
            // Fallback to empty array if API fails
            scholarshipData = [];
        }
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        // Fallback to empty array if API fails
        scholarshipData = [];
    }
    
    const checklistItems = [
        { text: "Academic Transcripts & Certificates", details: "Official records of your grades from high school and/or university." },
        { text: "Letters of Recommendation", details: "Ask teachers or employers who know you well. Give them at least one month's notice." },
        { text: "Personal Statement / Essays", details: "Your story: why you want to study this course and how the scholarship will help you." },
        { text: "Curriculum Vitae (CV) / Resume", details: "A summary of your education, work experience, and skills." },
        { text: "Proof of Language Proficiency (TOEFL/IELTS)", details: "Scores from standardized English tests. Check university requirements and book your test early!" },
        { text: "Valid Passport / ID Documents", details: "Ensure your passport is valid for the entire duration of your potential studies." }
    ];

    const keyTerms = [
        { term: "Fully Funded", definition: "Covers all major costs: tuition, living allowance (stipend), travel, and health insurance. Always check the specific details!" },
        { term: "Tuition Waiver", definition: "The university covers the cost of your classes, but you still need to pay for living expenses, books, etc." },
        { term: "Stipend / Living Allowance", definition: "A regular payment to cover your daily expenses like food, rent, and transport." },
        { term: "Conditional Offer", definition: "A university will accept you IF you meet remaining conditions, like achieving certain grades or an English test score." },
        { term: "Unconditional Offer", definition: "You have met all requirements and your place at the university is confirmed. Some scholarships require this." }
    ];

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');

    const filterMode = document.getElementById('filter-mode');
    const filterRegion = document.getElementById('filter-region');
    const filterLevel = document.getElementById('filter-level');
    const filterFunding = document.getElementById('filter-funding');
    const scholarshipGrid = document.getElementById('scholarship-grid');
    const scholarshipCount = document.getElementById('scholarship-count');
    const noResultsDiv = document.getElementById('no-results');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');
    
    const contributionForm = document.getElementById('contributionForm');
    const formSuccessMessage = document.getElementById('submissionResult');

    // Navigation is now handled in navigation.js
    
    function createScholarshipCard(scholarship) {
        const card = document.createElement('div');
        card.className = 'card bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col cursor-pointer';
        card.dataset.id = scholarship.id;

        const fundingTagColor = scholarship.funding === 'Yes' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800';
        const fundingText = scholarship.funding === 'Yes' ? 'Fully Funded' : 'Partially Funded';
        
        let levelText = scholarship.level.join(' / ');
        if(levelText.length > 30) {
           levelText = scholarship.level[0] + ' & more';
        }

        card.innerHTML = `
            <div class="flex-grow">
                <h3 class="text-xl font-bold text-[#3A5A40] mb-2">${scholarship.name}</h3>
                <p class="text-gray-500 text-sm mb-4">${scholarship.organization}</p>
                <div class="flex items-center text-gray-600 mb-2 text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>${scholarship.hostCountry}</span>
                </div>
                <div class="flex items-center text-gray-600 text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v11.494m-9-5.747h18"></path></svg>
                    <span>${levelText}</span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span class="tag ${fundingTagColor}">${fundingText}</span>
                <span class="text-sm font-semibold text-[#008080]">View Details →</span>
            </div>
        `;
        card.addEventListener('click', () => openModal(scholarship.id));
        return card;
    }

    function renderScholarships(filteredData) {
        scholarshipGrid.innerHTML = '';
        if (filteredData.length > 0) {
            filteredData.forEach(s => {
                const card = createScholarshipCard(s);
                scholarshipGrid.appendChild(card);
            });
            noResultsDiv.classList.add('hidden');
        } else {
            noResultsDiv.classList.remove('hidden');
        }
        scholarshipCount.textContent = `Showing ${filteredData.length} of ${scholarshipData.length} scholarships.`;
    }

    function filterData() {
        const mode = filterMode.value;
        const region = filterRegion.value;
        const level = filterLevel.value;
        const funding = filterFunding.value;

        const filtered = scholarshipData.filter(s => {
            const modeMatch = mode === 'all' || (mode === 'Online' ? s.region === 'Online' : s.region !== 'Online');
            const regionMatch = region === 'all' || s.region === region;
            const levelMatch = level === 'all' || s.level.includes(level);
            const fundingMatch = funding === 'all' || s.funding === funding;
            return modeMatch && regionMatch && levelMatch && fundingMatch;
        });

        renderScholarships(filtered);
    }

    function populateFilters() {
        const regions = [...new Set(scholarshipData.map(s => s.region))];
        regions.sort().forEach(region => {
            if (region !== 'Online') {
               const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                filterRegion.appendChild(option);
            }
        });
    }

    function openModal(id) {
        const scholarship = scholarshipData.find(s => s.id === id);
        if (!scholarship) return;
        
        document.getElementById('modal-title').textContent = scholarship.name;
        document.getElementById('modal-organization').textContent = scholarship.organization;
        const modalBody = document.getElementById('modal-body');
        
        const returnHomeColor = scholarship.returnHome === 'Yes' ? 'text-red-700' : 'text-green-700';
        const returnHomeIcon = scholarship.returnHome === 'Yes' 
            ? `<svg class="w-5 h-5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` 
            : `<svg class="w-5 h-5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div class="bg-gray-50 p-4 rounded-lg"><strong>Host:</strong> ${scholarship.hostCountry} (${scholarship.region})</div>
                <div class="bg-gray-50 p-4 rounded-lg"><strong>Level:</strong> ${scholarship.level.join(', ')}</div>
                <div class="bg-gray-50 p-4 rounded-lg"><strong>Application Deadline:</strong> ${scholarship.deadline}</div>
                <div class="bg-gray-50 p-4 rounded-lg font-semibold ${returnHomeColor}">${returnHomeIcon} Requires Return to Home Country: ${scholarship.returnHome}</div>
            </div>
            
            <div>
                <h4 class="font-bold text-lg mb-2">Funding Details</h4>
                <p class="text-gray-600">${scholarship.fundingDetails}</p>
            </div>

            <div>
                <h4 class="font-bold text-lg mb-2">Eligibility Criteria</h4>
                <p class="text-gray-600">${scholarship.eligibility}</p>
            </div>

            <div>
                <h4 class="font-bold text-lg mb-2">Application Process</h4>
                <p class="text-gray-600">${scholarship.applicationProcess}</p>
            </div>
            
            <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <h4 class="font-bold text-lg mb-2 text-amber-800">Expert Notes & Considerations</h4>
                <p class="text-amber-700">${scholarship.notes}</p>
            </div>
        `;

        document.getElementById('modal-link').href = scholarship.website;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
        }, 10);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    function populateChecklist() {
        const checklistContainer = document.getElementById('checklist');
        checklistItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-start';
            div.innerHTML = `
                <div class="flex items-center h-5">
                    <input id="check-${index}" type="checkbox" class="focus:ring-[#008080] h-5 w-5 text-[#008080] border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                    <label for="check-${index}" class="font-medium text-gray-800 cursor-pointer">${item.text}</label>
                    <p class="text-gray-500">${item.details}</p>
                </div>
            `;
            checklistContainer.appendChild(div);
        });
    }

    function populateKeyTerms() {
        const keyTermsContainer = document.getElementById('key-terms');
        keyTerms.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
                <p class="font-semibold text-gray-800">${item.term}</p>
                <p class="text-gray-600">${item.definition}</p>
            `;
            keyTermsContainer.appendChild(div);
        });
    }

    function createRegionChart() {
        const ctx = document.getElementById('regionChart').getContext('2d');
        const regionCounts = scholarshipData.reduce((acc, s) => {
            acc[s.region] = (acc[s.region] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(regionCounts);
        const data = Object.values(regionCounts);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Scholarships by Region',
                    data: data,
                    backgroundColor: [
                        'rgba(0, 128, 128, 0.7)', // Teal
                        'rgba(58, 90, 64, 0.7)',  // Dark Green
                        'rgba(122, 122, 102, 0.7)',// Grayish
                        'rgba(190, 140, 99, 0.7)', // Brown
                        'rgba(238, 204, 138, 0.7)'  // Light Brown
                    ],
                    borderColor: '#FDFBF8',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                }
            }
        });
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    [filterMode, filterRegion, filterLevel, filterFunding].forEach(filter => {
        filter.addEventListener('change', filterData);
    });
    
    contributionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show a temporary message while processing
        formSuccessMessage.innerHTML = `
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Processing...</strong>
                <span class="block sm:inline"> Submitting your contribution.</span>
            </div>
        `;
        formSuccessMessage.classList.remove('hidden');
        
        const formData = {
            scholarshipName: document.getElementById('scholarshipName').value,
            organization: document.getElementById('organization').value,
            website: document.getElementById('scholarshipWebsite').value,
            level: document.getElementById('studyLevel').value,
            hostCountry: document.getElementById('hostCountry').value,
            targetGroup: document.getElementById('targetGroup').value,
            deadline: document.getElementById('deadline').value,
            fundingType: document.getElementById('fundingType').value,
            fundingDetails: document.getElementById('fundingDetails').value,
            eligibility: document.getElementById('eligibility').value,
            applicationProcess: document.getElementById('applicationProcess').value,
            additionalNotes: document.getElementById('additionalNotes').value,
            submitterName: document.getElementById('submitterName').value,
            submitterEmail: document.getElementById('submitterEmail').value
        };

        console.log('Submitting form data:', formData);

        try {
            console.log('Sending to /api/contributions...');
            const response = await fetch('/api/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            console.log('Response ok:', response.ok);
            console.log('Result message:', result.message);
            console.log('Result id:', result.id);

            if (response.ok && result && (result.message || result.id)) {
                formSuccessMessage.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Success!</strong>
                        <span class="block sm:inline"> Your scholarship contribution has been submitted successfully and is pending review.</span>
                    </div>
                `;
                formSuccessMessage.classList.remove('hidden');
                contributionForm.reset();
            } else {
                console.error('Condition failed - response.ok:', response.ok, 'result:', result, 'message:', result?.message, 'id:', result?.id);
                throw new Error(result?.error || 'Failed to submit contribution');
            }
        } catch (error) {
            console.error('Error submitting contribution:', error);
            formSuccessMessage.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline"> ${error.message || 'Failed to submit contribution. Please try again.'}</span>
                    <p class="mt-2">Please check the browser console for more details.</p>
                </div>
            `;
            formSuccessMessage.classList.remove('hidden');
        }
    });

    populateFilters();
    filterData();
    populateChecklist();
    populateKeyTerms();
    createRegionChart();
}); 