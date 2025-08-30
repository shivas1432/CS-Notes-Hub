console.log('Script loaded successfully');
// Global State Management
let currentTheme = localStorage.getItem('theme') || 'light';
let currentSection = 'home';
let filesData = [];
let currentPage = 1;
let itemsPerPage = 12;
let currentView = 'grid';
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.0;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeIcons();
    loadFilesData();
    setupEventListeners();
    renderCategoriesGrid();
    renderRecentUploads();
});

// Theme Management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.setAttribute('data-lucide', currentTheme === 'light' ? 'moon' : 'sun');
        lucide.createIcons();
    }
}

// Icon Initialization
function initializeIcons() {
    lucide.createIcons();
}

// Data Management
async function loadFilesData() {
    try {
        const response = await fetch('data/files-index.json');
        if (response.ok) {
            const data = await response.json();
            filesData = data.files || [];
        } else {
            // Initialize with sample data if file doesn't exist
            filesData = generateSampleData();
        }
    } catch (error) {
        console.log('Loading sample data...');
        filesData = generateSampleData();
    }
}

function generateSampleData() {
    return [
        {
            id: "1",
            name: "binary-trees-complete-guide.pdf",
            title: "Complete Binary Trees Guide",
            category: "data-structures",
            description: "Comprehensive guide covering all aspects of binary trees including implementation, traversals, and advanced operations.",
            url: "notes/data-structures/binary-trees-complete-guide.pdf",
            uploadDate: "2025-01-15",
            size: "2.5MB",
            downloads: 142,
            thumbnail: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            id: "2",
            name: "sorting-algorithms-analysis.pdf",
            title: "Sorting Algorithms Analysis",
            category: "algorithms",
            description: "Deep dive into various sorting algorithms with time complexity analysis and implementation examples.",
            url: "notes/algorithms/sorting-algorithms-analysis.pdf",
            uploadDate: "2025-01-14",
            size: "3.1MB",
            downloads: 98,
            thumbnail: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            id: "3",
            name: "react-hooks-masterclass.pdf",
            title: "React Hooks Masterclass",
            category: "web-development",
            description: "Master React hooks with practical examples and best practices for modern React development.",
            url: "notes/web-development/react-hooks-masterclass.pdf",
            uploadDate: "2025-01-13",
            size: "4.2MB",
            downloads: 267,
            thumbnail: "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            id: "4",
            name: "neural-networks-fundamentals.pdf",
            title: "Neural Networks Fundamentals",
            category: "machine-learning",
            description: "Introduction to neural networks, backpropagation, and deep learning concepts.",
            url: "notes/machine-learning/neural-networks-fundamentals.pdf",
            uploadDate: "2025-01-12",
            size: "5.8MB",
            downloads: 189,
            thumbnail: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            id: "5",
            name: "database-design-principles.pdf",
            title: "Database Design Principles",
            category: "databases",
            description: "Learn database normalization, ER modeling, and design best practices.",
            url: "notes/databases/database-design-principles.pdf",
            uploadDate: "2025-01-11",
            size: "3.7MB",
            downloads: 156,
            thumbnail: "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
            id: "6",
            name: "operating-systems-concepts.pdf",
            title: "Operating Systems Concepts",
            category: "operating-systems",
            description: "Core OS concepts including process management, memory allocation, and file systems.",
            url: "notes/operating-systems/operating-systems-concepts.pdf",
            uploadDate: "2025-01-10",
            size: "6.2MB",
            downloads: 234,
            thumbnail: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
    ];
}

function getCategories() {
    // Use the counts directly from your JSON instead of calculating
    return {
        "algorithms": { name: "Algorithms", count: 0, icon: "zap" },
        "cheat-sheets": { name: "Cheat Sheets", count: 23, icon: "file-text" },
        "cybersecurity": { name: "Cybersecurity", count: 5, icon: "shield" },
        "data-structures": { name: "Data Structures", count: 10, icon: "database" },
        "databases": { name: "Databases", count: 21, icon: "server" },
        "devops": { name: "DevOps", count: 4, icon: "settings" },
        "general-computer-science": { name: "General Computer Science", count: 21, icon: "cpu" },
        "interview-preparation": { name: "Interview Preparation", count: 28, icon: "briefcase" },
        "machine-learning": { name: "Machine Learning", count: 4, icon: "brain" },
        "mobile-development": { name: "Mobile Development", count: 1, icon: "smartphone" },
        "operating-systems": { name: "Operating Systems", count: 1, icon: "monitor" },
        "computer-networks": { name: "Computer Networks", count: 1, icon: "network" },
        "software-engineering": { name: "Software Engineering", count: 1, icon: "code" },
        "programming-languages": { name: "Programming Languages", count: 61, icon: "terminal" },
        "web-development": { name: "Web Development", count: 20, icon: "globe" }
    };
}

function getFileCountByCategory(category) {
    return filesData.filter(file => file.category === category).length;
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }

    // Browse search
    const browseSearch = document.getElementById('browseSearch');
    if (browseSearch) {
        browseSearch.addEventListener('input', handleBrowseSearch);
    }

    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const category = pill.dataset.category;
            filterFilesByCategory(category);
        });
    });

    // Upload area
    setupUploadArea();

    // Browse filters
    setupBrowseFilters();

    // View toggle
    setupViewToggle();
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Update content based on section
        if (sectionId === 'browse') {
            renderFilesGrid();
            populateCategoryFilter();
        }
    }
}

// Rendering Functions
function renderCategoriesGrid() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    const categories = getCategories();
    
    grid.innerHTML = Object.entries(categories).map(([key, category]) => `
        <div class="category-card" onclick="showCategoryFiles('${key}')">
            <i data-lucide="${category.icon}" class="category-icon"></i>
            <h4 class="category-title">${category.name}</h4>
            <p class="category-count">${category.count} files</p>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderRecentUploads() {
    const container = document.getElementById('recentUploads');
    if (!container) return;
    
    const recentFiles = filesData
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 6);
    
    container.innerHTML = recentFiles.map(file => `
        <div class="upload-card" onclick="viewFile('${file.id}')">
            <div class="upload-header">
                <i data-lucide="file-text" class="file-icon"></i>
                <div class="upload-title">${file.title}</div>
            </div>
            <p class="file-description">${file.description}</p>
            <div class="upload-meta">
                <span>${formatDate(file.uploadDate)}</span>
                <span>${file.size}</span>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderFilesGrid(files = filesData) {
    const grid = document.getElementById('filesGrid');
    if (!grid) return;
    
    // Apply current view mode
    grid.className = `files-grid ${currentView === 'list' ? 'list-view' : ''}`;
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedFiles = files.slice(startIndex, endIndex);
    
    if (paginatedFiles.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i data-lucide="search-x" style="width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h3>No files found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    grid.innerHTML = paginatedFiles.map(file => `
        <div class="file-card" onclick="viewFile('${file.id}')">
            <div class="file-header">
                <div class="file-thumbnail">
                    <i data-lucide="file-text"></i>
                </div>
                <div class="file-info">
                    <h4>${file.title}</h4>
                    <span class="file-category">${getCategoryDisplayName(file.category)}</span>
                </div>
            </div>
            <p class="file-description">${file.description}</p>
            <div class="file-meta">
                <div class="file-stats">
                    <span><i data-lucide="download" style="width: 12px; height: 12px;"></i> ${file.downloads}</span>
                    <span>${file.size}</span>
                </div>
                <span>${formatDate(file.uploadDate)}</span>
            </div>
        </div>
    `).join('');
    
    renderPagination(files.length);
    lucide.createIcons();
}

function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">
            <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
        </button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="page-btn">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">
            <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
        </button>`;
    }
    
    pagination.innerHTML = paginationHTML;
    lucide.createIcons();
}

function changePage(page) {
    currentPage = page;
    renderFilesGrid();
}

// Search and Filter Functions
function handleGlobalSearch(event) {
    const query = event.target.value.trim();
    if (query.length > 0) {
        const results = searchFiles(query);
        showSearchResults(query, results);
    }
}

function handleBrowseSearch(event) {
    const query = event.target.value.trim();
    const filtered = searchFiles(query);
    renderFilesGrid(filtered);
}

function searchFiles(query) {
    if (!query) return filesData;
    
    const lowercaseQuery = query.toLowerCase();
    return filesData.filter(file => 
        file.title.toLowerCase().includes(lowercaseQuery) ||
        file.description.toLowerCase().includes(lowercaseQuery) ||
        file.category.toLowerCase().includes(lowercaseQuery) ||
        getCategoryDisplayName(file.category).toLowerCase().includes(lowercaseQuery)
    );
}

function showSearchResults(query, results) {
    showSection('search');
    
    const searchInfo = document.getElementById('searchInfo');
    if (searchInfo) {
        searchInfo.innerHTML = `
            <h3>Search Results for "${query}"</h3>
            <p>Found ${results.length} file${results.length !== 1 ? 's' : ''}</p>
        `;
    }
    
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i data-lucide="search-x" style="width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3>No results found</h3>
                    <p>Try using different keywords or browse by category</p>
                </div>
            `;
        } else {
            searchResults.className = 'files-grid';
            searchResults.innerHTML = results.map(file => `
                <div class="file-card" onclick="viewFile('${file.id}')">
                    <div class="file-header">
                        <div class="file-thumbnail">
                            <i data-lucide="file-text"></i>
                        </div>
                        <div class="file-info">
                            <h4>${file.title}</h4>
                            <span class="file-category">${getCategoryDisplayName(file.category)}</span>
                        </div>
                    </div>
                    <p class="file-description">${file.description}</p>
                    <div class="file-meta">
                        <div class="file-stats">
                            <span><i data-lucide="download" style="width: 12px; height: 12px;"></i> ${file.downloads}</span>
                            <span>${file.size}</span>
                        </div>
                        <span>${formatDate(file.uploadDate)}</span>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }
}

function showCategoryFiles(category) {
    showSection('browse');
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        filterFiles();
    }
}

function filterFilesByCategory(category) {
    if (category === 'all') {
        showSearchResults('All Categories', filesData);
    } else {
        const filtered = filesData.filter(file => file.category === category);
        showSearchResults(getCategoryDisplayName(category), filtered);
    }
}

// Browse Section Functions
function populateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    const categories = getCategories();
    filter.innerHTML = '<option value="">All Categories</option>' +
        Object.entries(categories).map(([key, category]) => 
            `<option value="${key}">${category.name}</option>`
        ).join('');
}

function setupBrowseFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterFiles);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', sortFiles);
    }
}

function setupViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderFilesGrid();
        });
    });
}

function filterFiles() {
    const categoryFilter = document.getElementById('categoryFilter');
    const browseSearch = document.getElementById('browseSearch');
    
    let filtered = filesData;
    
    if (categoryFilter && categoryFilter.value) {
        filtered = filtered.filter(file => file.category === categoryFilter.value);
    }
    
    if (browseSearch && browseSearch.value.trim()) {
        const query = browseSearch.value.trim().toLowerCase();
        filtered = filtered.filter(file => 
            file.title.toLowerCase().includes(query) ||
            file.description.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    renderFilesGrid(filtered);
}

function sortFiles() {
    const sortFilter = document.getElementById('sortFilter');
    if (!sortFilter) return;
    
    const sortBy = sortFilter.value;
    let sorted = [...filesData];
    
    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'date':
            sorted.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            break;
        case 'size':
            sorted.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
            break;
        case 'downloads':
            sorted.sort((a, b) => b.downloads - a.downloads);
            break;
    }
    
    renderFilesGrid(sorted);
}

// Upload Functions
function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadLink = document.getElementById('uploadLink');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadLink.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });
}

function handleFileSelection(file) {
    const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
        showToast('Please select a valid file type (PDF, DOC, DOCX, PPT, PPTX)', 'error');
        return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showToast('File size must be less than 50MB', 'error');
        return;
    }
    
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('uploadForm').style.display = 'block';
    document.getElementById('fileTitle').value = file.name.replace(/\.[^/.]+$/, "");
    
    // Store file for later upload
    window.selectedFile = file;
}

async function uploadFile() {
    const title = document.getElementById('fileTitle').value.trim();
    const category = document.getElementById('fileCategory').value;
    const description = document.getElementById('fileDescription').value.trim();
    
    if (!title || !category || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (!window.selectedFile) {
        showToast('Please select a file', 'error');
        return;
    }
    
    // Show progress
    document.getElementById('uploadForm').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'block';
    
    try {
        // Simulate upload progress
        await simulateUploadProgress();
        
        // Create new file entry
        const newFile = {
            id: Date.now().toString(),
            name: window.selectedFile.name,
            title: title,
            category: category,
            description: description,
            url: `notes/${category}/${window.selectedFile.name}`,
            uploadDate: new Date().toISOString().split('T')[0],
            size: formatFileSize(window.selectedFile.size),
            downloads: 0,
            thumbnail: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400"
        };
        
        // Add to files data
        filesData.unshift(newFile);
        
        showToast('File uploaded successfully!', 'success');
        resetUploadForm();
        renderCategoriesGrid();
        renderRecentUploads();
        
    } catch (error) {
        showToast('Upload failed. Please try again.', 'error');
        resetUploadForm();
    }
}

async function simulateUploadProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    for (let i = 0; i <= 100; i += 10) {
        progressFill.style.width = i + '%';
        progressText.textContent = `Uploading... ${i}%`;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function cancelUpload() {
    resetUploadForm();
}

function resetUploadForm() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('uploadForm').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('fileTitle').value = '';
    document.getElementById('fileCategory').value = '';
    document.getElementById('fileDescription').value = '';
    window.selectedFile = null;
}
// PDF Viewer Functions
async function viewFile(fileId) {
    const file = filesData.find(f => f.id === fileId);
    if (!file) return;
    
    showSection('view');
    document.getElementById('viewTitle').textContent = file.title;
    
    // Reset PDF viewer state
    pageNum = 1;
    scale = 1.0;
    pdfDoc = null;
    
    // Update download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadFile(file);
    }
    
    // Setup fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.onclick = () => toggleFullscreen();
    }
    
    // Initialize PDF viewer with actual PDF
    await initPDFViewer(file);
}

async function initPDFViewer(file) {
    const canvas = document.getElementById('pdfCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    try {
        // Construct correct PDF path
        const pdfUrl = `notes/${file.url}`;
        console.log('Loading PDF from:', pdfUrl);
        
        // Load the actual PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        
        // Render first page
        await renderPage(pageNum);
        
        // Setup navigation controls
        setupPDFNavigation();
        
        showToast('PDF loaded successfully', 'success');
        
    } catch (error) {
        console.error('Failed to load PDF:', error);
        showFallbackViewer(file, ctx, canvas);
    }
}

async function renderPage(num) {
    if (!pdfDoc) return;
    
    pageRendering = true;
    
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        updatePageInfo(num, pdfDoc.numPages);
        updateZoomInfo();
        
    } catch (error) {
        console.error('Error rendering page:', error);
        showToast('Error displaying PDF page', 'error');
    }
    
    pageRendering = false;
}

function setupPDFNavigation() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    
    // Remove existing event listeners
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    zoomInBtn.replaceWith(zoomInBtn.cloneNode(true));
    zoomOutBtn.replaceWith(zoomOutBtn.cloneNode(true));
    
    // Get fresh references
    const newPrevBtn = document.getElementById('prevPage');
    const newNextBtn = document.getElementById('nextPage');
    const newZoomInBtn = document.getElementById('zoomIn');
    const newZoomOutBtn = document.getElementById('zoomOut');
    
    newPrevBtn.onclick = () => {
        if (pageNum <= 1) return;
        pageNum--;
        renderPage(pageNum);
    };
    
    newNextBtn.onclick = () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
        pageNum++;
        renderPage(pageNum);
    };
    
    newZoomInBtn.onclick = () => {
        scale = Math.min(scale + 0.2, 3.0);
        renderPage(pageNum);
    };
    
    newZoomOutBtn.onclick = () => {
        scale = Math.max(scale - 0.2, 0.4);
        renderPage(pageNum);
    };
}

function showFallbackViewer(file, ctx, canvas) {
    canvas.width = 600;
    canvas.height = 800;
    
    // Show fallback content
    ctx.fillStyle = currentTheme === 'dark' ? '#2a2a2a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = currentTheme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('PDF Preview Unavailable', canvas.width / 2, 200);
    
    ctx.font = '16px Inter';
    ctx.fillText('Click Download to view the file', canvas.width / 2, 240);
    
    ctx.textAlign = 'left';
    ctx.font = '14px Inter';
    const lines = [
        'File: ' + file.title,
        'Category: ' + getCategoryDisplayName(file.category),
        'Size: ' + file.size,
        'Uploaded: ' + formatDate(file.uploadDate)
    ];
    
    lines.forEach((line, index) => {
        ctx.fillText(line, 50, 320 + (index * 25));
    });
    
    updatePageInfo(1, 1);
    showToast('PDF preview failed - file may not be accessible', 'error');
}

function updatePageInfo(current, total) {
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Page ${current} of ${total}`;
    }
}

function updateZoomInfo() {
    const zoomInfo = document.getElementById('zoomInfo');
    if (zoomInfo) {
        zoomInfo.textContent = Math.round(scale * 100) + '%';
    }
}

function toggleFullscreen() {
    const viewer = document.querySelector('.viewer-container');
    if (!document.fullscreenElement) {
        if (viewer.requestFullscreen) {
            viewer.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function downloadFile(file) {
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = `notes/${file.url}`;
        link.download = file.name;
        link.target = '_blank';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Downloading ${file.title}...`, 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// Rest of your utility functions remain the same...
function getCategoryDisplayName(category) {
    const categories = getCategories();
    return categories[category]?.name || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" style="width: 16px; height: 16px;"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// PDF.js Configuration
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (currentSection === 'view') {
            showSection('browse');
        } else if (currentSection !== 'home') {
            showSection('home');
        }
    }
    
    // PDF navigation shortcuts
    if (currentSection === 'view' && pdfDoc) {
        if (e.key === 'ArrowLeft' && pageNum > 1) {
            pageNum--;
            renderPage(pageNum);
        } else if (e.key === 'ArrowRight' && pageNum < pdfDoc.numPages) {
            pageNum++;
            renderPage(pageNum);
        }
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    if (currentSection === 'view' && pdfDoc) {
        renderPage(pageNum);
    }
});