// Shared motion and early theme restoration for every page.
(function () {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nativePageTransitions = 'CSSViewTransitionRule' in window;
    let navigating = false;
    let activeThemeTransition = null;

    if (!nativePageTransitions) root.classList.add('motion-fallback');

    function setThemeStylesheet(mode) {
        const stylesheet = document.getElementById('modeStylesheet');
        const href = mode === 'darkmode' ? './css/dark.css' : './css/light.css';
        if (!stylesheet || stylesheet.getAttribute('href') === href) return;
        stylesheet.setAttribute('href', href);
    }

    // Runs in the head, before page content is painted, to prevent theme flashes.
    try {
        const settings = JSON.parse(localStorage.getItem('userSettings') || 'null');
        if (settings?.mode) setThemeStylesheet(settings.mode);
    } catch { /* Keep the default theme if saved settings cannot be read. */ }

    for (const href of ['./css/light.css', './css/dark.css']) {
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'style';
        preload.href = href;
        document.head.appendChild(preload);
    }

    window.applyTheme = async function (mode, animate = false) {
        const stylesheet = document.getElementById('modeStylesheet');
        const href = mode === 'darkmode' ? './css/dark.css' : './css/light.css';
        if (!stylesheet || stylesheet.getAttribute('href') === href) return;
        if (!animate || reducedMotion.matches || document.hidden) {
            setThemeStylesheet(mode);
            return;
        }

        // Cancel an overlapping snapshot before starting the next theme change.
        activeThemeTransition?.skipTransition();
        root.classList.add('theme-changing');
        const update = () => new Promise(resolve => {
            const finish = () => {
                clearTimeout(timeout);
                stylesheet.removeEventListener('load', finish);
                stylesheet.removeEventListener('error', finish);
                resolve();
            };
            const timeout = setTimeout(finish, 1500);
            stylesheet.addEventListener('load', finish);
            stylesheet.addEventListener('error', finish);
            setThemeStylesheet(mode);
        });

        if (document.startViewTransition) {
            root.classList.add('theme-snapshot');
            const transition = document.startViewTransition(update);
            activeThemeTransition = transition;
            try { await transition.finished; } catch { /* A skipped transition still applies the theme. */ }
            finally {
                if (activeThemeTransition === transition) {
                    activeThemeTransition = null;
                    root.classList.remove('theme-changing', 'theme-snapshot');
                }
            }
        } else {
            await update();
            await new Promise(resolve => setTimeout(resolve, 320));
            root.classList.remove('theme-changing');
        }
    };

    window.navigateToPage = function (href) {
        const destination = new URL(href, location.href);
        if (navigating) return;
        if (nativePageTransitions || reducedMotion.matches || destination.origin !== location.origin) {
            location.assign(destination.href);
            return;
        }
        navigating = true;
        root.classList.add('page-leaving');
        setTimeout(() => location.assign(destination.href), 140);
    };

    document.addEventListener('click', event => {
        if (nativePageTransitions || reducedMotion.matches || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.target.closest?.('a[href]');
        if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
        const destination = new URL(anchor.href, location.href);
        if (destination.origin !== location.origin || !['http:', 'https:'].includes(destination.protocol)) return;
        if (destination.pathname === location.pathname && destination.search === location.search) return;
        event.preventDefault();
        window.navigateToPage(destination.href);
    });

    // Restore content when returning from the browser's back/forward cache.
    window.addEventListener('pageshow', () => {
        navigating = false;
        root.classList.remove('page-leaving');
    });
})();
