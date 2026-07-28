document.addEventListener('DOMContentLoaded', () => {
    const ROUTES = {
        'ha-noi-hai-phong': { cities: ['Hà Nội', 'Hải Phòng'], ghep: 400000, 'bao-5': 900000, 'bao-7': 1000000 },
        'hai-phong-ha-long': { cities: ['Hải Phòng', 'Hạ Long'], ghep: 250000, 'bao-5': 400000, 'bao-7': 600000 },
        'hai-phong-mong-cai': { cities: ['Hải Phòng', 'Móng Cái'], ghep: 500000, 'bao-5': 1400000, 'bao-7': 1500000 }
    };
    const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyRr01m0RpgLXwIavEqUe0z9z8BmZ0DlZDvWMJzabIjzX9Du0xnF6jOegHC3_40NGOj6w/exec';

    const routeSelect = document.getElementById('route-select');
    const serviceType = document.getElementById('service-type');
    const seatsCount = document.getElementById('seats-count');
    const pickupDisplay = document.getElementById('pickup-display');
    const dropoffDisplay = document.getElementById('dropoff-display');
    const priceDisplay = document.getElementById('estimated-price');
    let reversed = false;

    const money = value => value.toLocaleString('vi-VN') + 'đ';
    const currentRoute = () => ROUTES[routeSelect.value];
    const currentDirection = () => {
        const cities = currentRoute().cities;
        return reversed ? [cities[1], cities[0]] : cities;
    };
    const update = () => {
        const route = currentRoute();
        const [pickup, dropoff] = currentDirection();
        pickupDisplay.textContent = pickup;
        dropoffDisplay.textContent = dropoff;
        const isShared = serviceType.value === 'ghep';
        seatsCount.disabled = !isShared;
        seatsCount.style.opacity = isShared ? '1' : '.5';
        const price = isShared ? route.ghep * (parseInt(seatsCount.value, 10) || 1) : route[serviceType.value];
        priceDisplay.textContent = money(price);
        return { route, pickup, dropoff, price };
    };

    routeSelect.addEventListener('change', () => {
        reversed = false;
        update();
    });
    serviceType.addEventListener('change', update);
    seatsCount.addEventListener('change', update);
    document.getElementById('swap-route').addEventListener('click', () => {
        reversed = !reversed;
        update();
    });

    document.querySelectorAll('.select-route').forEach(button => button.addEventListener('click', () => {
        routeSelect.value = button.dataset.route;
        reversed = false;
        update();
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));

    const dateInput = document.getElementById('travel-date');
    const timeInput = document.getElementById('travel-time');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateValue = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dateInput.min = dateValue(today);
    dateInput.value = dateValue(tomorrow);
    timeInput.value = `${String((today.getHours() + 2) % 24).padStart(2, '0')}:00`;

    const menu = document.querySelector('.mobile-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = () => {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    menuToggle.addEventListener('click', () => {
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        menuToggle.setAttribute('aria-expanded', 'true');
    });
    document.querySelector('.menu-close').addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    const modal = document.getElementById('confirm-modal');
    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    };
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-done').addEventListener('click', closeModal);

    document.getElementById('booking-form').addEventListener('submit', event => {
        event.preventDefault();
        const state = update();
        const name = document.getElementById('passenger-name').value;
        const phone = document.getElementById('passenger-phone').value;
        const date = dateInput.value;
        const time = timeInput.value;
        const typeText = serviceType.options[serviceType.selectedIndex].text;
        const data = new URLSearchParams({
            date,
            time,
            pickup: state.pickup,
            dropoff: state.dropoff,
            route: `${state.pickup} - ${state.dropoff}`,
            type: serviceType.value === 'ghep' ? `${typeText} (${seatsCount.value} ghế)` : typeText,
            name,
            phone,
            price: money(state.price)
        });
        fetch(ENDPOINT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data.toString()
        }).catch(error => console.error('Không thể gửi thông tin đặt xe:', error));
        document.getElementById('modal-summary').innerHTML = `<strong>${state.pickup} → ${state.dropoff}</strong><br>${typeText} · ${date} ${time}<br>${name} · ${phone}<br><strong>${money(state.price)}</strong>`;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    });

    update();
});
