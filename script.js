document.addEventListener('DOMContentLoaded', async () => {
    // Ensure page starts at the absolute top (including header)
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Prevent any scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Force scroll to absolute top after a brief delay
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 100);

    // Initialize the sections (will be handled by navigation.js)
    if (typeof initializeSections === 'function') {
        initializeSections();
    }

    // Fetch scholarship data from API
    let scholarshipData = [];
    
    try {
        console.log('Fetching scholarships from API...');
        const response = await fetch('/api/scholarships');
        console.log('API response status:', response.status);
        
        if (response.ok) {
            scholarshipData = await response.json();
            console.log('Successfully loaded', scholarshipData.length, 'scholarships from API');
        } else {
            console.error('Failed to fetch scholarships:', response.status);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            // Fallback to empty array if API fails
            scholarshipData = [];
        }
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        // Fallback to empty array if API fails
        scholarshipData = [];
    }

    // Remove the hardcoded data - it will now come from the API
    /*
    const scholarshipData = [
    {
        id: 1,
        name: 'University of the People Afghan Women\'s Fund',
        organization: 'University of the People (UoPeople)',
        hostCountry: 'Online',
        region: 'Online',
        targetGroup: 'Afghan Women',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Ongoing (apply for admission first)',
        funding: 'Yes',
        fundingDetails: 'Full tuition coverage. UoPeople is tuition-free but has assessment fees per course, which this scholarship covers.',
        returnHome: 'No',
        website: 'https://www.uopeople.edu/tuition-free/our-scholarships/afghan-womens-scholarship-fund/',
        notes: 'This is a highly accessible option as it is online and specifically targets Afghan women. The key is to first secure admission to UoPeople.',
        eligibility: 'Must be a female Afghan citizen, demonstrate financial need, and gain admission to UoPeople.',
        applicationProcess: '1. Apply for admission to UoPeople. 2. Once accepted, request the scholarship via the student portal.'
    },
    {
        id: 2,
        name: 'L.E.A.R.N. Initiative',
        organization: 'Embrace Relief',
        hostCountry: 'Online',
        region: 'Online',
        targetGroup: 'Afghan Girls',
        level: [
            'High School',
            'Bachelor\'s'
        ],
        deadline: 'Currently Accepting Applications',
        funding: 'Partial',
        fundingDetails: 'Provides financial aid covering at minimum tuition. \'Full Support\' options can include internet, materials, and mentorship.',
        returnHome: 'No',
        website: 'https://www.embracerelief.org/l-e-a-r-n-initiative-empowering-afghan-girls-through-education/',
        notes: 'Offers a structured pathway from high school (GED) to a Bachelor\'s degree online. The \'full support\' option is particularly valuable.',
        eligibility: 'Afghan girls eligible for high school (grades 10-12) or Bachelor\'s studies. An interview is part of the selection process.',
        applicationProcess: 'Complete the online application via the Embrace Relief website and participate in an interview if shortlisted.'
    },
    {
        id: 3,
        name: 'Shafia Fund – Right to Learn',
        organization: 'Right to Learn Afghanistan',
        hostCountry: 'Canada (Administered)',
        region: 'North America',
        targetGroup: 'Afghan Women/Girls (in Afghanistan & region)',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Check website',
        funding: 'Partial',
        fundingDetails: 'Up to 47,000 AFN for education expenses like tuition, transport, books, devices. Prioritizes most urgent needs.',
        returnHome: 'No',
        website: 'https://righttolearn.ca/programs/',
        notes: 'Highly relevant due to its flexibility, supporting students within Afghanistan and the surrounding region. The \'in the region\' eligibility is a significant advantage.',
        eligibility: 'Afghan women and girls of any age, accepted or enrolled in an educational program. Can apply once a year.',
        applicationProcess: 'Submit the application via the designated Google Form on their website. Shortlisted applicants will be interviewed.'
    },
    {
        id: 8,
        name: 'Qatar Scholarship for Afghans Project (QSAP)',
        organization: 'IIE, Education Above All, Qatar Fund for Development',
        hostCountry: 'USA',
        region: 'North America',
        targetGroup: 'Displaced Afghan Students (esp. at-risk, women)',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Managed by IIE (specific intake cycles)',
        funding: 'Yes',
        fundingDetails: 'Full scholarship for study at approximately 50 partner colleges and universities in the United States.',
        returnHome: 'No',
        website: 'https://www.iie.org/news/qsap-welcomes-100-new-refugee-students-to-us-colleges/',
        notes: 'A major and highly relevant initiative. Focuses on Afghans who were at risk, with 50% of scholarships for women. Opportunity is for study in the US.',
        eligibility: 'Displaced Afghan students. Selection is managed through IIE and its partners.',
        applicationProcess: 'The program is managed by the Institute of International Education (IIE). Check the IIE website for information on new application cycles.'
    },
    {
        id: 9,
        name: 'University of Toronto At-Risk Awards',
        organization: 'University of Toronto',
        hostCountry: 'Canada',
        region: 'North America',
        targetGroup: 'Students impacted by conflict (incl. Afghans)',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Varies (e.g., Jan 15, Feb 28)',
        funding: 'Partial',
        fundingDetails: 'Non-repayable bursary support up to $10,000 CAD to assist with educational costs.',
        returnHome: 'No',
        website: 'https://future.utoronto.ca/finances/scholarships/',
        notes: 'This is not a full scholarship but a bursary to help with costs for students already admitted or applying to U of T.',
        eligibility: 'Undergraduate students at U of T whose education has been disrupted by conflict or war, including those from Afghanistan. Must demonstrate financial need.',
        applicationProcess: 'Apply through the University of Toronto\'s financial aid system after being admitted.'
    },
    {
        id: 10,
        name: 'Türkiye Bursları',
        organization: 'Turkish Government',
        hostCountry: 'Turkey',
        region: 'Asia',
        targetGroup: 'International Students',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Jan 10 - Feb 20',
        funding: 'Yes',
        fundingDetails: 'Tuition, monthly stipend, round-trip travel, health insurance, accommodation, and a mandatory one-year Turkish language course.',
        returnHome: 'No',
        website: 'https://www.turkiyeburslari.gov.tr/',
        notes: 'A very comprehensive scholarship. The mandatory Turkish language course is a key feature, as many programs are taught in Turkish.',
        eligibility: 'Non-Turkish citizens meeting age limits (e.g., under 21 for undergrad) and academic merit requirements (e.g., 70-75% min grades).',
        applicationProcess: 'Apply online via the Türkiye Bursları website. The process includes document evaluation and an interview for shortlisted candidates.'
    },
    {
        id: 11,
        name: 'KNB Scholarship',
        organization: 'Indonesian Government',
        hostCountry: 'Indonesia',
        region: 'Asia',
        targetGroup: 'Students from Developing Countries',
        level: [
            'Bachelor\'s'
        ],
        deadline: 'Annually (~Feb-March)',
        funding: 'Yes',
        fundingDetails: 'Settlement allowance, monthly living allowances, research/book allowances, health insurance, and round-trip airfare.',
        returnHome: 'No',
        website: 'http://knb.kemdikbud.go.id/',
        notes: 'Requires a recommendation letter from the Indonesian Embassy in your country of residence, which is a crucial step.',
        eligibility: 'Citizen of a developing country, meet age limits, and prove English proficiency (e.g., IELTS 5.5).',
        applicationProcess: 'Obtain a recommendation letter from the Indonesian Embassy, then apply online through the KNB portal.'
    }
];
*/
    
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

    let modal, modalContent, modalClose;
    
    // Initialize modal elements with error checking
    function initializeModal() {
        modal = document.getElementById('modal');
        modalContent = document.getElementById('modal-content');
        modalClose = document.getElementById('modal-close');
        
        if (!modal || !modalContent || !modalClose) {
            console.error('Modal elements not found:', { modal, modalContent, modalClose });
            return false;
        }
        
        // Set up modal event listeners
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        return true;
    }
    
    const contributionForm = document.getElementById('contributionForm');
    const formSuccessMessage = document.getElementById('submissionResult');

    // Navigation is now handled in navigation.js
    
    function createScholarshipCard(scholarship) {
        const card = document.createElement('div');
        card.className = 'card bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
        card.dataset.id = scholarship.id;

        const fundingClass = scholarship.funding === 'Yes' ? 'fully-funded' : 'partially-funded';
        const fundingText = scholarship.funding === 'Yes' ? 'Fully Funded' : 'Partially Funded';
        
        let levelText = scholarship.level.join(' / ');
        if(levelText.length > 30) {
           levelText = scholarship.level[0] + ' & more';
        }

        card.innerHTML = `
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-3">
                    <span class="tag ${fundingClass}">${fundingText}</span>
                    <svg class="icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold heading-accent mb-2 line-clamp-2">${scholarship.name}</h3>
                <p class="text-gray-500 text-sm mb-4 font-medium">${scholarship.organization}</p>
                <div class="space-y-2">
                    <div class="flex items-center text-sm">
                        <svg class="icon w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>${scholarship.hostCountry}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <svg class="icon w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v11.494m-9-5.747h18"></path>
                        </svg>
                        <span>${levelText}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <svg class="icon w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 0v2a4 4 0 11-8 0V7"></path>
                        </svg>
                        <span class="text-xs">${scholarship.deadline}</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span class="text-sm font-semibold link-accent flex items-center">
                    View Details 
                    <svg class="icon w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </span>
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
        if (!scholarship) {
            console.error('Scholarship not found:', id);
            return;
        }
        
        if (!modal) {
            console.error('Modal not initialized');
            return;
        }
        
        const modalTitle = document.getElementById('modal-title');
        const modalOrganization = document.getElementById('modal-organization');
        const modalBody = document.getElementById('modal-body');
        
        if (!modalTitle || !modalOrganization || !modalBody) {
            console.error('Modal content elements not found');
            return;
        }
        
        modalTitle.textContent = scholarship.name;
        modalOrganization.textContent = scholarship.organization;
        
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
        modal.classList.add('active');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            if (modalContent) {
                modalContent.classList.remove('scale-95');
            }
        }, 10);
    }

    function closeModal() {
        if (!modal) return;
        
        modal.classList.add('opacity-0');
        modal.classList.remove('active');
        if (modalContent) {
            modalContent.classList.add('scale-95');
        }
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

    let regionChartInstance = null;
    function createRegionChart(withAnimation = false) {
        const canvas = document.getElementById('regionChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const regionCounts = scholarshipData.reduce((acc, s) => {
            acc[s.region] = (acc[s.region] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(regionCounts);
        const data = Object.values(regionCounts);
        const isDark = document.documentElement.classList.contains('dark');
        const chartBg = isDark ? '#0E131A' : '#FDFBF8';
        const legendColor = isDark ? '#E5E7EB' : '#1F2937';
        const ringColors = isDark
          ? [
              'rgba(16, 185, 129, 0.9)',
              'rgba(99, 102, 241, 0.85)',
              'rgba(245, 158, 11, 0.9)',
              'rgba(168, 162, 158, 0.9)',
              'rgba(59, 130, 246, 0.85)'
            ]
          : [
              'rgba(16, 185, 129, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 69, 19, 0.8)',
              'rgba(107, 114, 128, 0.8)'
            ];

        if (regionChartInstance) {
            try { regionChartInstance.destroy(); } catch (_) {}
            regionChartInstance = null;
        }

        regionChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Scholarships by Region',
                    data: data,
                    backgroundColor: ringColors,
                    borderColor: chartBg,
                    borderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: withAnimation,
                rotation: 0,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: legendColor,
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                }
            }
        });

        canvas.style.backgroundColor = 'transparent';
    }

    // expose a trigger for navigation to animate chart on demand
    window.triggerGuideChart = () => createRegionChart(true);

    // Initialize modal first
    initializeModal();

    [filterMode, filterRegion, filterLevel, filterFunding].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', filterData);
        }
    });
    
    if (contributionForm) {
        contributionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show a temporary message while processing
            if (formSuccessMessage) {
                formSuccessMessage.innerHTML = `
                    <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Processing...</strong>
                        <span class="block sm:inline"> Submitting your contribution.</span>
                    </div>
                `;
                formSuccessMessage.classList.remove('hidden');
            }
            
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
                    if (formSuccessMessage) {
                        formSuccessMessage.innerHTML = `
                            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                <strong class="font-bold">Success!</strong>
                                <span class="block sm:inline"> Your scholarship contribution has been submitted successfully and is pending review.</span>
                            </div>
                        `;
                        formSuccessMessage.classList.remove('hidden');
                    }
                    contributionForm.reset();
                } else {
                    console.error('Condition failed - response.ok:', response.ok, 'result:', result, 'message:', result?.message, 'id:', result?.id);
                    throw new Error(result?.error || 'Failed to submit contribution');
                }
            } catch (error) {
                console.error('Error submitting contribution:', error);
                if (formSuccessMessage) {
                    formSuccessMessage.innerHTML = `
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">Error!</strong>
                            <span class="block sm:inline"> ${error.message || 'Failed to submit contribution. Please try again.'}</span>
                            <p class="mt-2">Please check the browser console for more details.</p>
                        </div>
                    `;
                    formSuccessMessage.classList.remove('hidden');
                }
            }
        });
    }

    // Initialize everything
    populateFilters();
    filterData();
    populateChecklist();
    populateKeyTerms();
    createRegionChart(false);

    // Re-render chart on theme change
    document.addEventListener('themechange', () => {
        try { createRegionChart(); } catch (_) {}
    });
}); 
