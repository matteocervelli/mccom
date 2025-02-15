// Function to toggle mobile filters
function toggleMobileFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    const body = document.body;
    
    sidebar.classList.toggle('active');
    body.classList.toggle('filters-open');

    // Close when clicking outside
    if (sidebar.classList.contains('active')) {
        document.addEventListener('click', function closeOnClickOutside(e) {
            if (!sidebar.contains(e.target) && !e.target.closest('.mobile-filter-button')) {
                sidebar.classList.remove('active');
                body.classList.remove('filters-open');
                document.removeEventListener('click', closeOnClickOutside);
            }
        });
    }
}

// Function to toggle filter sections
function toggleFilter(filterType) {
    const header = document.querySelector(`[onclick="toggleFilter('${filterType}')"]`);
    const options = document.getElementById(`${filterType}-options`);
    const icon = header.querySelector('.toggle-icon');
    
    header.classList.toggle('active');
    options.classList.toggle('active');
    
    if (header.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// Function to get available options for each filter type
function getAvailableOptions(selectedFilters) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const availableOptions = {
        role: new Set(),
        industry: new Set(),
        department: new Set()
    };

    testimonials.forEach(testimonial => {
        const roles = testimonial.dataset.roles ? testimonial.dataset.roles.toLowerCase().split(',').map(r => r.trim()) : [];
        const industry = testimonial.dataset.industry ? testimonial.dataset.industry.toLowerCase().trim() : '';
        const departments = testimonial.dataset.departments ? testimonial.dataset.departments.toLowerCase().split(',').map(d => d.trim()) : [];
        
        // For roles, check against industry and department filters
        if ((selectedFilters.industry.length === 0 || selectedFilters.industry.includes(industry)) &&
            (selectedFilters.department.length === 0 || departments.some(d => selectedFilters.department.includes(d)))) {
            roles.forEach(role => availableOptions.role.add(role));
        }
        
        // For industries, check against role and department filters
        if ((selectedFilters.role.length === 0 || roles.some(r => selectedFilters.role.includes(r))) &&
            (selectedFilters.department.length === 0 || departments.some(d => selectedFilters.department.includes(d)))) {
            if (industry) availableOptions.industry.add(industry);
        }

        // For departments, check against role and industry filters
        if ((selectedFilters.role.length === 0 || roles.some(r => selectedFilters.role.includes(r))) &&
            (selectedFilters.industry.length === 0 || selectedFilters.industry.includes(industry))) {
            departments.forEach(dept => availableOptions.department.add(dept));
        }
    });

    return availableOptions;
}

// Function to update filter options visibility
function updateFilterOptions(selectedFilters) {
    const availableOptions = getAvailableOptions(selectedFilters);

    // Update role options
    document.querySelectorAll('#role-options .filter-option').forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox.value === 'all') return;

        if (selectedFilters.industry.length === 0 && selectedFilters.department.length === 0 || 
            availableOptions.role.has(checkbox.value)) {
            option.classList.remove('disabled');
            checkbox.disabled = false;
        } else {
            option.classList.add('disabled');
            checkbox.disabled = true;
        }
    });

    // Update industry options
    document.querySelectorAll('#industry-options .filter-option').forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox.value === 'all') return;

        if (selectedFilters.role.length === 0 && selectedFilters.department.length === 0 || 
            availableOptions.industry.has(checkbox.value)) {
            option.classList.remove('disabled');
            checkbox.disabled = false;
        } else {
            option.classList.add('disabled');
            checkbox.disabled = true;
        }
    });

    // Update department options
    document.querySelectorAll('#department-options .filter-option').forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox.value === 'all') return;

        if (selectedFilters.role.length === 0 && selectedFilters.industry.length === 0 || 
            availableOptions.department.has(checkbox.value)) {
            option.classList.remove('disabled');
            checkbox.disabled = false;
        } else {
            option.classList.add('disabled');
            checkbox.disabled = true;
        }
    });
}

// Function to filter testimonials
function filterTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const roleFilters = Array.from(document.querySelectorAll('#role-options input:checked:not([value="all"]'))
        .map(input => input.value.toLowerCase());
    const industryFilters = Array.from(document.querySelectorAll('#industry-options input:checked:not([value="all"]'))
        .map(input => input.value.toLowerCase());
    const departmentFilters = Array.from(document.querySelectorAll('#department-options input:checked:not([value="all"]'))
        .map(input => input.value.toLowerCase());
    const searchQuery = document.getElementById('search-filter').value.toLowerCase();

    const selectedFilters = {
        role: roleFilters,
        industry: industryFilters,
        department: departmentFilters
    };

    testimonials.forEach(testimonial => {
        const roles = testimonial.dataset.roles ? testimonial.dataset.roles.toLowerCase().split(',') : [];
        const industry = testimonial.dataset.industry ? testimonial.dataset.industry.toLowerCase() : '';
        const departments = testimonial.dataset.departments ? testimonial.dataset.departments.toLowerCase().split(',') : [];
        const searchContent = testimonial.dataset.search.toLowerCase();

        // Debug logging
        console.log('Card:', {
            name: testimonial.dataset.name,
            roles,
            industry,
            departments,
            roleFilters,
            industryFilters,
            departmentFilters
        });

        const matchesRole = roleFilters.length === 0 || roles.some(role => roleFilters.includes(role.trim()));
        const matchesIndustry = industryFilters.length === 0 || industryFilters.includes(industry.trim());
        const matchesDepartment = departmentFilters.length === 0 || departments.some(dept => departmentFilters.includes(dept.trim()));
        const matchesSearch = searchQuery === '' || searchContent.includes(searchQuery);

        // Debug logging for matches
        console.log('Matches:', {
            name: testimonial.dataset.name,
            matchesRole,
            matchesIndustry,
            matchesDepartment,
            matchesSearch
        });

        testimonial.style.display = matchesRole && matchesIndustry && matchesDepartment && matchesSearch ? 'block' : 'none';
    });

    updateFilterOptions(selectedFilters);
}

// Function to clear all filters
function clearFilters() {
    // Reset all checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = false;
        checkbox.closest('.filter-option').classList.remove('disabled');
    });
    
    // Check all "All" options
    document.querySelectorAll('input[value="all"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Clear search input
    const searchInput = document.getElementById('search-filter');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset filter display
    filterTestimonials();
}

// Function to sort testimonials
function sortTestimonials() {
    const container = document.getElementById('testimonials-container');
    const testimonials = Array.from(container.getElementsByClassName('testimonial-card'));
    const sortType = document.getElementById('sort-select').value;

    // Helper function to safely parse dates and convert to UTC
    const parseDate = (dateStr) => {
        try {
            // Parse the date and convert to UTC timestamp
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateStr);
                return new Date(0); // Return epoch for invalid dates
            }
            return date;
        } catch (e) {
            console.error('Error parsing date:', dateStr, e);
            return new Date(0);
        }
    };

    // Debug log before sorting
    console.log('Before sorting:', testimonials.map(t => ({
        name: t.dataset.name,
        lastmod: t.dataset.lastmod,
        parsed: parseDate(t.dataset.lastmod).toISOString()
    })));

    testimonials.sort((a, b) => {
        switch (sortType) {
            case 'newest':
            case 'oldest':
                const dateA = parseDate(a.dataset.lastmod);
                const dateB = parseDate(b.dataset.lastmod);
                
                // Log comparison for debugging
                console.log('Comparing dates:', {
                    sortType,
                    a: a.dataset.name,
                    b: b.dataset.name,
                    dateA: dateA.toISOString(),
                    dateB: dateB.toISOString(),
                    comparison: sortType === 'newest' ? dateB - dateA : dateA - dateB
                });
                
                // For 'newest', we want descending order (B-A)
                // For 'oldest', we want ascending order (A-B)
                return sortType === 'newest' ? dateB - dateA : dateA - dateB;
            case 'az':
                return (a.dataset.name || '').localeCompare(b.dataset.name || '');
            case 'za':
                return (b.dataset.name || '').localeCompare(a.dataset.name || '');
            default:
                return 0;
        }
    });

    // Debug log after sorting
    console.log('After sorting:', testimonials.map(t => ({
        name: t.dataset.name,
        lastmod: t.dataset.lastmod,
        parsed: parseDate(t.dataset.lastmod).toISOString(),
        sortType
    })));

    // Re-append sorted testimonials
    testimonials.forEach(testimonial => container.appendChild(testimonial));
}

// Event listeners for filters
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all filter sections as closed
    document.querySelectorAll('.filter-options').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.filter-header').forEach(header => {
        header.classList.remove('active');
        const icon = header.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }
    });

    // Add event listeners for filters
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.value === 'all') {
                const filterGroup = checkbox.closest('.filter-options');
                filterGroup.querySelectorAll('input[type="checkbox"]:not([value="all"])').forEach(cb => {
                    cb.checked = false;
                });
            } else {
                const allCheckbox = checkbox.closest('.filter-options').querySelector('input[value="all"]');
                if (allCheckbox) {
                    allCheckbox.checked = false;
                }
            }
            filterTestimonials();
        });
    });

    // Add event listener for search
    const searchInput = document.getElementById('search-filter');
    if (searchInput) {
        searchInput.addEventListener('input', filterTestimonials);
    }

    // Initial filter application
    filterTestimonials();

    // Close filters when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('filters-sidebar');
        const mobileButton = document.querySelector('.mobile-filter-button');
        
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !mobileButton.contains(e.target)) {
            toggleMobileFilters();
        }
    });

    // Initial sort by newest
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'newest';
        sortTestimonials();
        
        // Log initial sort state with more details
        const testimonials = document.querySelectorAll('.testimonial-card');
        console.log('Initial testimonials data:', Array.from(testimonials).map(t => ({
            name: t.dataset.name,
            lastmod: t.dataset.lastmod,
            parsedDate: new Date(t.dataset.lastmod).toISOString()
        })));
    }
}); 