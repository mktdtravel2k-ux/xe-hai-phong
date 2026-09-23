(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    const progress = document.createElement('div');
    progress.className = 'scroll-line';
    progress.setAttribute('aria-hidden', 'true');
    document.body.append(progress);
    let pending = false;
    const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
        header.classList.toggle('has-depth', scrollY > 20);
        hero.style.setProperty('--scenic-y', !reduced.matches && fine.matches && innerWidth > 760 ? `${Math.min(scrollY * .08, 65)}px` : '0px');
        pending = false;
    };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, {passive: true});
    addEventListener('resize', update);
    update();
    if (!reduced.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {threshold: .07});
        document.querySelectorAll('.section-heading,.route-card,.how-intro,.step,.contact-band-inner,.callback-grid>div,.faq-title,.faq-list,.footer-grid>div').forEach(el => {
            el.classList.add('reveal');
            if (el.classList.contains('route-card')) el.style.setProperty('--delay', `${Array.from(el.parentNode.children).indexOf(el) * 90}ms`);
            observer.observe(el);
        });
        document.documentElement.classList.add('motion-enabled');
        reduced.addEventListener('change', () => {
            if (reduced.matches) { observer.disconnect(); document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible')); }
            update();
        });
    }
    document.querySelectorAll('.route-card').forEach(card => {
        let frame = 0;
        card.addEventListener('pointermove', event => {
            if (!fine.matches || reduced.matches || frame) return;
            const x = event.clientX, y = event.clientY;
            frame = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--light-x', `${x - rect.left}px`);
                card.style.setProperty('--light-y', `${y - rect.top}px`);
                frame = 0;
            });
        }, {passive: true});
    });
    const price = document.getElementById('estimated-price');
    document.querySelectorAll('#route-select,#service-type,#seats-count').forEach(input => input.addEventListener('change', () => {
        price.classList.remove('price-updated');
        requestAnimationFrame(() => requestAnimationFrame(() => price.classList.add('price-updated')));
    }));
})();
