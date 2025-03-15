// Cookie Consent Management
class CookieConsent {
    constructor() {
        this.consentKey = 'cookie_consent_status';
        this.preferencesKey = 'cookie_preferences';
        this.modal = document.getElementById('cookie-consent-modal');
        this.banner = document.getElementById('cookie-consent-banner');
        this.container = document.querySelector('.cookie-consent-container');
        
        // Track technical services
        this.technicalServices = {
            cloudflare: true,
            cloudflareInsights: true,
            fontawesome: true,
            jsdelivr: true,
            netlify: true,
            stripe: true,
            swiper: true,
            fuse: true,
            themePreference: true,
            languagePreference: true
        };

        // Se non ci sono consensi salvati, mostra il banner invece del modal
        if (!this.hasStoredConsent()) {
            this.showBanner();
        }

        this.initElements();
        this.initEventListeners();
        this.loadPreferences();

        // Initialize accordion for cookie categories
        if (typeof Accordion !== 'undefined') {
            this.accordion = new Accordion({
                toggleSelector: '.details-toggle',
                iconSelector: '.chevron',
                onToggle: (toggle, isExpanded) => {
                    console.debug(`Cookie category ${toggle.getAttribute('aria-controls')} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
                }
            });
        } else {
            console.warn('Accordion class not found, skipping accordion initialization');
        }

        // Expose modal functions globally
        window.openCookieModal = () => this.openModal();
        window.closeCookieModal = () => this.closeModal();
    }

    initElements() {
        // Tabs
        this.tabs = document.querySelectorAll('.tab-button');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // Consent buttons
        this.rejectOptionalBtns = document.querySelectorAll('[data-action="reject-optional"]');
        this.customizeBtns = document.querySelectorAll('[data-action="customize"]');
        this.acceptAllBtns = document.querySelectorAll('[data-action="accept-all"]');
        this.savePreferencesBtn = document.querySelector('[data-action="save-preferences"]');
        
        // Cookie toggles
        this.cookieToggles = {
            analytics: document.getElementById('analytics-cookies'),
            profiling: document.getElementById('profiling-cookies'),
            social: document.getElementById('social-cookies')
        };

        // Details toggles (kept for reference but not used)
        this.detailsToggles = document.querySelectorAll('.details-toggle');

        // Set language
        document.documentElement.lang = document.documentElement.lang || 'en';

        // Aggiungiamo un riferimento al banner
        this.bannerButtons = {
            rejectOptional: this.banner?.querySelector('[data-action="reject-optional"]'),
            customize: this.banner?.querySelector('[data-action="customize"]'),
            acceptAll: this.banner?.querySelector('[data-action="accept-all"]')
        };
    }

    initEventListeners() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Remove details toggle event listeners from the class to avoid conflicts
        // We'll handle this with the external initialization function
        
        // Consent actions
        this.rejectOptionalBtns.forEach(btn => 
            btn.addEventListener('click', () => this.rejectOptional()));
        
        this.customizeBtns.forEach(btn => 
            btn.addEventListener('click', () => this.customize(btn)));
        
        this.acceptAllBtns.forEach(btn => 
            btn.addEventListener('click', () => this.acceptAll()));
        
        this.savePreferencesBtn?.addEventListener('click', () => this.savePreferences());

        // Close modal on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Aggiungiamo eventi per i pulsanti del banner
        this.bannerButtons.rejectOptional?.addEventListener('click', () => this.rejectOptional());
        this.bannerButtons.customize?.addEventListener('click', () => {
            this.hideBanner();
            this.openModal();
            // Passa automaticamente al tab dei dettagli
            this.switchTab('details');
        });
        this.bannerButtons.acceptAll?.addEventListener('click', () => this.acceptAll());
        
        // Aggiungiamo l'evento per gestire la dimensione condizionale
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
                
                // Modifica la classe del container in base al tab attivo
                if (targetTab === 'details') {
                    this.container.classList.add('details-active');
                } else {
                    this.container.classList.remove('details-active');
                }
            });
        });
    }

    showBanner() {
        if (this.banner) {
            this.banner.classList.add('show');
        }
    }

    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('show');
        }
    }

    switchTab(tabId) {
        this.tabs.forEach(t => t.classList.remove('active'));
        this.tabPanes.forEach(p => p.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Gestione condizionale dei pulsanti basata sulla scheda attiva
        if (tabId === 'details') {
            // Mostra il pulsante "Salva preferenze" e nascondi "Personalizza"
            this.savePreferencesBtn.style.display = 'inline-block';
            this.customizeBtns.forEach(btn => {
                if (btn.getAttribute('data-target-tab') === 'details') {
                    btn.style.display = 'none';
                }
            });
            this.container.classList.add('details-active');
        } else {
            // Nascondi il pulsante "Salva preferenze" e mostra "Personalizza"
            this.savePreferencesBtn.style.display = 'none';
            this.customizeBtns.forEach(btn => {
                btn.style.display = 'inline-block';
            });
            this.container.classList.remove('details-active');
        }
    }

    rejectOptional() {
        Object.values(this.cookieToggles).forEach(toggle => {
            if (toggle) toggle.checked = false;
        });
        this.savePreferences();
        this.closeModal();
        this.hideBanner();
    }

    customize(btn) {
        const targetTab = btn.getAttribute('data-target-tab');
        if (targetTab) this.switchTab(targetTab);
    }

    acceptAll() {
        Object.values(this.cookieToggles).forEach(toggle => {
            if (toggle) toggle.checked = true;
        });
        this.savePreferences();
        this.closeModal();
        this.hideBanner();
    }

    savePreferences() {
        const preferences = {
            analytics: this.cookieToggles.analytics?.checked || false,
            profiling: this.cookieToggles.profiling?.checked || false,
            social: this.cookieToggles.social?.checked || false
        };

        localStorage.setItem(this.consentKey, 'custom');
        localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));

        this.applyPreferences(preferences);
        this.closeModal();
    }

    loadPreferences() {
        const preferences = JSON.parse(localStorage.getItem(this.preferencesKey) || '{}');
        
        // Update toggles
        Object.entries(this.cookieToggles).forEach(([key, toggle]) => {
            if (toggle) toggle.checked = preferences[key] || false;
        });

        this.applyPreferences(preferences);
    }

    checkConsentStatus() {
        const status = localStorage.getItem(this.consentKey);
        if (!status) {
            this.showBanner();
        } else {
            this.loadPreferences();
        }
    }

    showBanner() {
        if (this.banner) {
            this.banner.classList.add('show');
        }
    }

    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('show');
        }
    }

    openPreferences() {
        this.hideBanner();
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.loadPreferences();
        }
    }

    closePreferences() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }

    applyPreferences(preferences) {
        // Analytics cookies
        if (preferences.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Profiling cookies
        if (preferences.profiling) {
            this.enableProfiling();
        } else {
            this.disableProfiling();
        }

        // Social cookies
        if (preferences.social) {
            this.enableSocial();
        } else {
            this.disableSocial();
        }
    }

    enableAnalytics() {
        // Check if we're in production environment
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1' &&
                            !window.location.hostname.includes('dev.') &&
                            !window.location.hostname.includes('staging.') &&
                            !window.location.hostname.includes('test.');
        
        if (!isProduction) {
            console.log('Analytics disabled in non-production environment');
            return;
        }

        // Enable Umami Analytics
        if (!document.querySelector('script[data-website-id="40d83e8d-a45a-43d8-b9c8-db93176c0420"]')) {
            const umamiScript = document.createElement('script');
            umamiScript.setAttribute('async', '');
            umamiScript.setAttribute('defer', '');
            umamiScript.setAttribute('data-website-id', '40d83e8d-a45a-43d8-b9c8-db93176c0420');
            umamiScript.setAttribute('src', 'https://cloud.umami.is/script.js');
            document.head.appendChild(umamiScript);
    
            // Set cookie for Umami
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            document.cookie = `umami.uuid=${this.generateUUID()}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        }
        
        // Enable Ahrefs Analytics
        if (!document.querySelector('script[data-key="WVZPgYoen8uQz3GD87Degg"]')) {
            const ahrefsScript = document.createElement('script');
            ahrefsScript.setAttribute('async', '');
            ahrefsScript.setAttribute('src', 'https://analytics.ahrefs.com/analytics.js');
            ahrefsScript.setAttribute('data-key', 'WVZPgYoen8uQz3GD87Degg');
            document.head.appendChild(ahrefsScript);
        }

        // Enable Cloudflare Analytics if needed
        if (!document.querySelector('script[src*="cloudflare.com/beacon.min.js"]')) {
            const cloudflareScript = document.createElement('script');
            cloudflareScript.setAttribute('defer', '');
            cloudflareScript.setAttribute('src', 'https://static.cloudflareinsights.com/beacon.min.js');
            document.head.appendChild(cloudflareScript);
        }
    }

    disableAnalytics() {
        // Remove Umami Analytics
        const umamiScript = document.querySelector('script[data-website-id="40d83e8d-a45a-43d8-b9c8-db93176c0420"]');
        if (umamiScript) {
            umamiScript.remove();
        }
        
        // Remove Umami cookie
        document.cookie = 'umami.uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
        
        // Remove Ahrefs Analytics
        const ahrefsScript = document.querySelector('script[data-key="WVZPgYoen8uQz3GD87Degg"]');
        if (ahrefsScript) {
            ahrefsScript.remove();
        }

        // Remove Cloudflare Analytics
        const cloudflareScript = document.querySelector('script[src*="cloudflare.com/beacon.min.js"]');
        if (cloudflareScript) {
            cloudflareScript.remove();
        }
        
        // Clean up analytics objects safely
        try {
            if (window._umamiSettings) {
                window._umamiSettings = undefined;
            }
            if (window.ahrefs) {
                window.ahrefs = undefined;
            }
        } catch (e) {
            console.warn('Error cleaning up analytics objects:', e);
        }
    }

    // Helper function to generate UUID for Umami
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    enableProfiling() {
        // Load scripts in sequence to ensure proper initialization
        const loadScripts = async () => {
            try {
                // Enable Calendly
                if (!document.querySelector('script[src*="calendly"]')) {
                    const calendlyScript = document.createElement('script');
                    calendlyScript.setAttribute('type', 'text/javascript');
                    calendlyScript.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
                    
                    await new Promise((resolve, reject) => {
                        calendlyScript.onload = () => {
                            if (window.Calendly) {
                                resolve();
                            } else {
                                console.warn('Calendly not properly initialized');
                                resolve(); // Continuiamo comunque
                            }
                        };
                        calendlyScript.onerror = () => {
                            console.warn('Failed to load Calendly');
                            resolve(); // Continuiamo anche in caso di errore
                        };
                        document.head.appendChild(calendlyScript);
                    });
                }

                // Enable Kit - rimuovo temporaneamente Kit se non è necessario
                /* if (!document.querySelector('script[src*="kit"]')) {
                    const kitScript = document.createElement('script');
                    kitScript.setAttribute('type', 'text/javascript');
                    kitScript.setAttribute('src', 'https://js.kit.co/v1/kit.js');
                    
                    await new Promise((resolve, reject) => {
                        kitScript.onload = resolve;
                        kitScript.onerror = () => {
                            console.warn('Failed to load Kit');
                            resolve(); // Continuiamo anche in caso di errore
                        };
                        document.head.appendChild(kitScript);
                    });
                } */

            } catch (error) {
                console.warn('Error loading profiling scripts:', error);
                // Non lanciamo l'errore, continuiamo l'esecuzione
            }
        };

        // Initialize loading with retry mechanism
        const initializeWithRetry = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    await loadScripts();
                    console.log('All profiling scripts loaded successfully');
                    break;
                } catch (error) {
                    if (i === retries - 1) {
                        console.warn('Failed to load scripts after', retries, 'attempts:', error);
                    } else {
                        console.warn('Retry attempt', i + 1, 'of', retries);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    }
                }
            }
        };

        initializeWithRetry();
    }

    disableProfiling() {
        // Remove scripts safely
        const removeScript = (selector) => {
            const script = document.querySelector(selector);
            if (script) {
                script.remove();
            }
        };

        // Remove all profiling scripts
        removeScript('script[src*="calendly"]');
        removeScript('script[src*="kit"]');

        // Hide Calendly widgets
        const calendlyWidgets = document.querySelectorAll('.calendly-inline-widget');
        calendlyWidgets.forEach(widget => {
            widget.style.display = 'none';
        });

        // Clean up global objects safely
        try {
            if (window.Calendly) window.Calendly = undefined;
            if (window.Kit) window.Kit = undefined;
        } catch (e) {
            console.warn('Error cleaning up profiling objects:', e);
        }
    }

    enableSocial() {
        // Enable Bluesky embeds
        document.querySelectorAll('.bluesky-embed').forEach(embed => {
            embed.style.display = 'block';
        });
    }

    disableSocial() {
        // Disable Bluesky embeds
        document.querySelectorAll('.bluesky-embed').forEach(embed => {
            embed.style.display = 'none';
        });
    }

    openModal(options = {}) {
        if (this.modal) {
            this.modal.classList.add('active');
            document.body.classList.add('scroll-lock');
            document.body.style.overflow = 'hidden';
            
            // Determina quale tab aprire all'inizio
            const defaultTab = options.defaultTab || 'consent';
            
            // Passa alla scheda specificata
            this.switchTab(defaultTab);
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            document.body.classList.remove('scroll-lock');
            document.body.style.overflow = '';
        }
    }

    hasStoredConsent() {
        return localStorage.getItem(this.consentKey) !== null;
    }
}

// Initialize cookie consent management
document.addEventListener('DOMContentLoaded', function() {
    const cookieConsent = new CookieConsent();

    // Event listeners for cookie modal
    document.querySelectorAll('[data-open-cookie-settings]').forEach(button => {
        button.addEventListener('click', () => {
            cookieConsent.openModal({ defaultTab: 'details' });
        });
    });

    // Correggo l'accesso al bannerButtons che era undefined
    if (cookieConsent.bannerButtons && cookieConsent.bannerButtons.customize) {
        cookieConsent.bannerButtons.customize.addEventListener('click', () => {
            cookieConsent.hideBanner();
            cookieConsent.openModal({ defaultTab: 'details' });
        });
    }

    document.getElementById('cookie-consent-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            cookieConsent.closeModal();
        }
    });
}); 