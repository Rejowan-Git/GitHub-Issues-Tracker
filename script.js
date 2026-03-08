// State variables
let allIssues = [];
let currentCategory = 'all'; 
const API_BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const issuesGrid = document.getElementById('issues-grid');
const loader = document.getElementById('loader');
const issueCountDisplay = document.getElementById('issue-count-display');
const searchInput = document.getElementById('search-input');

// Modal Elements
const modal = document.getElementById('issue-modal');
const modalTitle = document.getElementById('modal-title');
const modalStatus = document.getElementById('modal-status');
const modalAuthorDate = document.getElementById('modal-author-date');
const modalLabels = document.getElementById('modal-labels');
const modalDescription = document.getElementById('modal-description');
const modalAssignee = document.getElementById('modal-assignee');
const modalPriority = document.getElementById('modal-priority');

// --- LOGIN LOGIC ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        mainPage.classList.add('flex');
        fetchIssues(); // Load data on login
    } else {
        loginError.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    mainPage.classList.add('hidden');
    mainPage.classList.remove('flex');
    loginPage.classList.remove('hidden');
});

// --- API FETCHING ---
async function fetchIssues() {
    showMainLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/issues`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        allIssues = Array.isArray(data) ? data : (data.data || data.issues || []);
        
        filterAndRenderIssues();
    } catch (error) {
        console.error('Fetch error:', error);
        issuesGrid.innerHTML = `<p class="text-red-500 col-span-full text-center py-8 font-bold">Failed to load issues. Please ensure you are running this on a local server (like Live Server).</p>`;
    } finally {
        hideMainLoader();
    }
}

async function searchIssues(query) {
    showMainLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/issues/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        allIssues = Array.isArray(data) ? data : (data.data || data.issues || []);
        
        changeTab('all', false); // Reset to 'all' tab when searching
        filterAndRenderIssues();
    } catch (error) {
        console.error('Search error:', error);
        issuesGrid.innerHTML = `<p class="text-red-500 col-span-full text-center py-8 font-bold">Failed to search issues.</p>`;
    } finally {
        hideMainLoader();
    }
}

// Search debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    searchTimeout = setTimeout(() => {
        if (query) {
            searchIssues(query);
        } else {
            fetchIssues(); // reload all if search is cleared
        }
    }, 500);
});

// --- RENDER LOGIC ---
function changeTab(tabName, reRender = true) {
    currentCategory = tabName;
    
    // Update Button Styles (Shows Active Tab Clearly)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'active');
        btn.classList.add('text-gray-600', 'bg-transparent');
    });

    const activeBtn = document.getElementById(`tab-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-600', 'bg-transparent');
        activeBtn.classList.add('bg-primary', 'text-white', 'active'); // Highlights active tab
    }

    if (reRender) filterAndRenderIssues();
}

function filterAndRenderIssues() {
    let filteredIssues = allIssues;
    if (currentCategory === 'open') {
        filteredIssues = allIssues.filter(issue => (issue.status || issue.state || '').toLowerCase() === 'open');
    } else if (currentCategory === 'closed') {
        filteredIssues = allIssues.filter(issue => (issue.status || issue.state || '').toLowerCase() === 'closed');
    }

    // Update Count text
    issueCountDisplay.innerText = `${filteredIssues.length} Issues`;

    issuesGrid.innerHTML = ''; // Only clear the grid when re-rendering tabs or loading
    
    if(filteredIssues.length === 0) {
        issuesGrid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-8 font-medium">No issues found in this category.</p>`;
        return;
    }

    filteredIssues.forEach(issue => {
        // Handle variations in API keys safely
        const status = (issue.status || issue.state || 'open').toLowerCase();
        const isClosed = status === 'closed';
        const borderColorClass = isClosed ? 'border-statusPurple' : 'border-success'; // Purple for closed, Green for open
        const statusIconPath = isClosed ? './assets/Closed- Status .png' : './assets/Open-Status.png';
        
        const dateStr = formatDate(issue.createdAt || issue.created_at || issue.date);
        const authorName = issue.author?.login || issue.author?.name || issue.author || 'Unknown';
        
        const priority = (issue.priority || 'Low').toUpperCase();
        let priorityClasses = 'bg-gray-100 text-gray-700';
        if (priority === 'HIGH') priorityClasses = 'bg-red-50 text-red-500';
        if (priority === 'MEDIUM') priorityClasses = 'bg-yellow-50 text-yellow-600';

        const desc = (issue.body || issue.description || 'No description provided.');
        const truncatedDesc = desc.length > 80 ? desc.substring(0, 80) + '...' : desc;

        let labelsHtml = '';
        const labels = issue.labels || [];
        labels.forEach(label => {
            const labelName = typeof label === 'string' ? label : label.name;
            labelsHtml += getLabelBadge(labelName);
        });

        // HTML for 4 Column Layout Card
        const cardHtml = `
            <div class="issue-card bg-white rounded-lg p-5 border border-gray-200 border-t-4 ${borderColorClass} cursor-pointer flex flex-col justify-between h-full" onclick="openModal('${issue.id || issue._id || issue.number}')">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <img src="${statusIconPath}" alt="Status" class="w-5 h-5" onerror="this.outerHTML='<span class=\\\'w-3 h-3 rounded-full ${isClosed ? 'bg-statusPurple' : 'bg-success'}\\\'></span>'">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityClasses}">${priority}</span>
                    </div>
                    <h3 class="font-bold text-gray-900 text-sm mb-2 leading-snug">${issue.title || 'Untitled Issue'}</h3>
                    <p class="text-xs text-gray-500 mb-4 line-clamp-2">${truncatedDesc}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${labelsHtml}
                    </div>
                </div>
                <div class="pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                    #${issue.id || issue.number || '0'} by ${authorName} <br> ${dateStr}
                </div>
            </div>
        `;
        issuesGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// --- MODAL LOGIC ---
async function openModal(id) {
    // Show Modal Immediately over the background (No wiping the grid!)
    modal.classList.remove('hidden');
    
    // Set Temporary Loading Text in the Modal
    modalTitle.innerText = 'Loading Issue Details...';
    modalDescription.innerText = 'Please wait while we fetch the details...';
    modalStatus.innerText = 'LOADING';
    modalStatus.className = 'px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-200 uppercase tracking-wide';
    modalAuthorDate.innerText = '';
    modalAssignee.innerText = '...';
    modalPriority.innerText = '...';
    modalPriority.className = 'px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-200 inline-block mt-1';
    modalLabels.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/issue/${id}`);
        if(!response.ok) throw new Error("Failed to load issue info");
        
        let issueData = await response.json();
        // Extract data object safely
        const issue = issueData.data || issueData.issue || issueData;
        
        // Populate Real Data
        const status = (issue.status || issue.state || 'open').toLowerCase();
        const isClosed = status === 'closed';
        const dateStr = formatDate(issue.createdAt || issue.created_at || issue.date);
        const authorName = issue.author?.login || issue.author?.name || issue.author || 'Unknown';
        const assigneeName = issue.assignee?.login || issue.assignee?.name || issue.assignee || 'Unassigned';

        modalTitle.innerText = issue.title || 'Untitled Issue';
        
        modalStatus.innerText = isClosed ? 'Closed' : 'Opened';
        modalStatus.className = `px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide ${isClosed ? 'bg-statusPurple' : 'bg-success'}`;
        
        modalAuthorDate.innerText = `Opened by ${authorName} • ${dateStr}`;
        modalDescription.innerText = issue.body || issue.description || 'No description provided.';
        modalAssignee.innerText = assigneeName;
        
        const priority = (issue.priority || 'Low').toUpperCase();
        let prioBg = 'bg-gray-400';
        if (priority === 'HIGH') prioBg = 'bg-red-500';
        if (priority === 'MEDIUM') prioBg = 'bg-yellow-500';
        modalPriority.innerText = priority;
        modalPriority.className = `px-3 py-1 rounded-full text-xs font-bold text-white inline-block mt-1 ${prioBg}`;

        let labelsHtml = '';
        const labels = issue.labels || [];
        labels.forEach(label => {
            const labelName = typeof label === 'string' ? label : label.name;
            labelsHtml += getLabelBadge(labelName);
        });
        modalLabels.innerHTML = labelsHtml;

    } catch (error) {
        console.error(error);
        modalTitle.innerText = 'Error';
        modalDescription.innerText = 'Failed to fetch full issue details. Please check your connection.';
    }
}

function closeModal() {
    modal.classList.add('hidden');
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const d = new Date(dateString);
    if(isNaN(d.getTime())) return dateString; 
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function getLabelBadge(labelName) {
    let classes = 'border-gray-200 text-gray-600 bg-gray-50'; 
    const textLower = labelName.toLowerCase();

    if(textLower.includes('bug')) classes = 'border-red-200 text-red-500 bg-red-50';
    else if (textLower.includes('help')) classes = 'border-yellow-200 text-yellow-600 bg-yellow-50';
    else if (textLower.includes('enhancement')) classes = 'border-green-200 text-green-600 bg-green-50';

    return `<span class="px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase ${classes}">${labelName}</span>`;
}

// Main Loader only wipes grid on initial load or category change
function showMainLoader() {
    issuesGrid.innerHTML = '';
    loader.classList.remove('hidden');
}
function hideMainLoader() {
    loader.classList.add('hidden');
}

// Close Modal when clicking outside the box
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});