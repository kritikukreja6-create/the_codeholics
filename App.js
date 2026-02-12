/* ============================================================
   SafeHer — Women Safety App
   app.js  |  All application logic + Google Maps integration
   ============================================================ */

/* ── App State ── */
let currentLanguage = 'en';
let emergencyActive = false;
let flashlightOn = false;
let locationShared = false;
let darkModeOn = false;
let chatMessages = [];

/* ── Google Maps State ── */
let map = null;                   // Google Map instance
let userMarker = null;            // Yellow "You are here" marker
let userLatLng = null;            // google.maps.LatLng of user
let activeMarkers = [];           // All search-result markers
let directionsRenderer = null;    // Renders the route polyline
let directionsService = null;     // Requests route from Google
let placesService = null;         // Nearby search service
let destinationRowVisible = false;

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const translations = {
    en: {
        appName: 'SafeHer',
        home: 'Home',
        emergency: 'Emergency',
        saferRoute: 'Safer Routes',
        emergencyAlert: 'EMERGENCY ALERT',
        activateEmergency: 'Tap to Activate Emergency',
        alarmActive: 'ALARM ACTIVE - Get Help!',
        contactsText: 'Emergency Contacts',
        shareLocation: 'Share Location with Contacts',
        locationShared: 'Location Shared!',
        stopSharing: 'Stop Sharing',
        saferRouteTitle: 'Safer Routes',
        selectDestination: 'Select your destination',
        findSafeRoute: 'Find Safe Route',
        emergencyContactsTitle: 'Emergency Contacts',
        trustedPeopleTitle: 'Trusted People',
        safetyTipsTitle: 'Stay Alert, Stay Safe',
        chatbotTitle: 'Safety Chat Assistant',
        askHelp: 'Ask for help or tips...',
        flashlight: 'Flashlight',
        hospitalsText: 'Hospitals',
        policeStationsText: 'Police Stations',
        safeZonesText: 'Safe Zones',
        safetyTips: [
            '✓ Always share your location with trusted contacts',
            '✓ Avoid walking alone after dark',
            '✓ Keep emergency numbers saved',
            '✓ Trust your instincts',
            '✓ Stay aware of your surroundings',
            '✓ Use verified transportation services'
        ],
        chatResponses: [
            'Stay in well-lit areas and avoid dark streets.',
            'Always inform someone about your location.',
            'Trust your instincts and leave uncomfortable situations.',
            'Keep your phone charged and within reach.',
            'Travel with friends when possible.',
            'Use verified taxis or ride-sharing apps.'
        ]
    },
    hi: {
        appName: 'सेफ़हर',
        home: 'होम',
        emergency: 'आपात',
        saferRoute: 'सुरक्षित मार्ग',
        emergencyAlert: 'आपातकालीन सतर्कता',
        activateEmergency: 'आपात सक्रिय करने के लिए टैप करें',
        alarmActive: 'अलर्ट सक्रिय - मदद लें!',
        contactsText: 'आपातकालीन संपर्क',
        shareLocation: 'संपर्कों के साथ स्थान साझा करें',
        locationShared: 'स्थान साझा किया गया!',
        stopSharing: 'साझाकरण बंद करें',
        saferRouteTitle: 'सुरक्षित मार्ग',
        selectDestination: 'अपना गंतव्य चुनें',
        findSafeRoute: 'सुरक्षित मार्ग खोजें',
        emergencyContactsTitle: 'आपातकालीन संपर्क',
        trustedPeopleTitle: 'विश्वासपात्र लोग',
        safetyTipsTitle: 'सतर्क रहें, सुरक्षित रहें',
        chatbotTitle: 'सुरक्षा चैट सहायक',
        askHelp: 'मदद या सुझाव के लिए पूछें...',
        flashlight: 'टॉर्च',
        hospitalsText: 'अस्पताल',
        policeStationsText: 'पुलिस स्टेशन',
        safeZonesText: 'सुरक्षित क्षेत्र',
        safetyTips: [
            '✓ हमेशा विश्वासपात्र लोगों के साथ अपना स्थान साझा करें',
            '✓ अंधेरे के बाद अकेले चलने से बचें',
            '✓ आपातकालीन नंबर सहेजें',
            '✓ अपनी प्रवृत्ति पर विश्वास करें',
            '✓ अपने आसपास के बारे में जागरूक रहें',
            '✓ सत्यापित परिवहन सेवाएं का उपयोग करें'
        ],
        chatResponses: [
            'अच्छी तरह से प्रकाश वाले क्षेत्रों में रहें।',
            'हमेशा किसी को अपने स्थान के बारे में बताएं।',
            'अपनी प्रवृत्ति पर विश्वास करें।',
            'अपने फोन को चार्ज रखें।',
            'मित्रों के साथ यात्रा करें।',
            'सत्यापित टैक्सी का उपयोग करें।'
        ]
    }
};

/* ── Contact Data ── */
const emergencyContacts = {
    en: [
        { name: 'Police Emergency', number: '100',  icon: '🚔' },
        { name: 'Women Helpline',   number: '1091', icon: '📞' },
        { name: 'Ambulance',        number: '102',  icon: '🚑' }
    ],
    hi: [
        { name: 'पुलिस आपातकाल',    number: '100',  icon: '🚔' },
        { name: 'महिला सहायता रेखा', number: '1091', icon: '📞' },
        { name: 'एम्बुलेंस',         number: '102',  icon: '🚑' }
    ]
};

const trustedContacts = [
    { name: 'Mom',    phone: '+91-9876543210' },
    { name: 'Sister', phone: '+91-8765432109' }
];

/* ============================================================
   TRANSLATION HELPER
   ============================================================ */
function t(key) {
    return translations[currentLanguage][key] || key;
}

/* ============================================================
   DARK MODE
   ============================================================ */
function toggleDarkMode() {
    darkModeOn = !darkModeOn;
    const btn = document.getElementById('darkModeBtn');
    if (darkModeOn) {
        document.body.classList.add('dark-mode');
        btn.textContent = '☀️ Light';
    } else {
        document.body.classList.remove('dark-mode');
        btn.textContent = '🌙 Dark';
    }
    // Re-render trusted contacts so inline styles respect current theme
    updateTrustedContacts();
}

/* ============================================================
   LANGUAGE
   ============================================================ */
function changeLanguage() {
    currentLanguage = document.getElementById('languageSelect').value;
    updateLanguage();
}

function updateLanguage() {
    document.getElementById('appName').textContent             = t('appName');
    document.getElementById('emergencyTitle').textContent      = t('activateEmergency');
    document.getElementById('saferRouteText').textContent      = t('saferRoute');
    document.getElementById('contactsText').textContent        = t('contactsText');
    document.getElementById('locationText').textContent        = t('shareLocation');
    document.getElementById('chatText').textContent            = t('chatbotTitle');
    document.getElementById('safetyTipsTitle').textContent     = t('safetyTipsTitle');
    document.getElementById('homeText').textContent            = t('home');
    document.getElementById('homeText2').textContent           = t('home');
    document.getElementById('emergencyContactsTitle').textContent = t('emergencyContactsTitle');
    document.getElementById('trustedPeopleTitle').textContent  = t('trustedPeopleTitle');
    document.getElementById('saferRouteTitle').textContent     = t('saferRouteTitle');
    document.getElementById('selectDestination').textContent   = t('selectDestination');
    document.getElementById('findSafeRouteText').textContent   = t('findSafeRoute');
    document.getElementById('hospitalsText').textContent       = t('hospitalsText');
    document.getElementById('policeStationsText').textContent  = t('policeStationsText');
    document.getElementById('safeZonesText').textContent       = t('safeZonesText');
    document.getElementById('chatbotTitle').textContent        = t('chatbotTitle');
    document.getElementById('askHelpText').textContent         = t('askHelp');

    updateSafetyTips();
    updateEmergencyContacts();
    updateTrustedContacts();
}

function updateSafetyTips() {
    const tipsList = document.getElementById('safetyTipsList');
    tipsList.innerHTML = '';
    t('safetyTips').forEach(tip => {
        const p = document.createElement('p');
        p.textContent = tip;
        tipsList.appendChild(p);
    });
}

function updateEmergencyContacts() {
    const grid = document.getElementById('emergencyContactsGrid');
    grid.innerHTML = '';
    emergencyContacts[currentLanguage].forEach(contact => {
        const card = document.createElement('a');
        card.href = `tel:${contact.number}`;
        card.className = 'contact-card';
        card.innerHTML = `
            <div class="contact-icon">${contact.icon}</div>
            <div class="contact-name">${contact.name}</div>
            <div class="contact-number">${contact.number}</div>
        `;
        grid.appendChild(card);
    });
}

function updateTrustedContacts() {
    const list = document.getElementById('trustedContactsList');
    list.innerHTML = '';
    const isDark = document.body.classList.contains('dark-mode');

    trustedContacts.forEach(contact => {
        const card = document.createElement('a');
        card.href = `tel:${contact.phone}`;

        if (isDark) {
            card.style.cssText = 'display:block;background-color:#000000;border:2px solid #ec4899;border-radius:0.5rem;padding:1.5rem;margin-bottom:0.75rem;text-decoration:none;color:#ffffff;cursor:pointer;transition:all 0.3s;';
            card.onmouseover = () => card.style.boxShadow = '0 10px 25px rgba(236,72,153,0.3)';
            card.onmouseout  = () => card.style.boxShadow = 'none';
            card.innerHTML = `
                <div style="color:#ec4899;font-weight:bold;font-size:1.125rem;">👤 ${contact.name}</div>
                <div style="color:#ffffff;font-size:0.875rem;margin-top:0.5rem;">📱 ${contact.phone}</div>
            `;
        } else {
            card.style.cssText = 'display:block;background-color:#fbcfe8;border:2px solid #ec4899;border-radius:0.5rem;padding:1.5rem;margin-bottom:0.75rem;text-decoration:none;color:inherit;cursor:pointer;transition:all 0.3s;';
            card.onmouseover = () => card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            card.onmouseout  = () => card.style.boxShadow = 'none';
            card.innerHTML = `
                <div style="color:#be185d;font-weight:bold;font-size:1.125rem;">👤 ${contact.name}</div>
                <div style="color:#831843;font-size:0.875rem;margin-top:0.5rem;">📱 ${contact.phone}</div>
            `;
        }
        list.appendChild(card);
    });
}

/* ============================================================
   EMERGENCY
   ============================================================ */
function playAlarm() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode   = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0,   audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function toggleEmergency() {
    const btn      = document.getElementById('emergencyBtn');
    const icon     = document.getElementById('emergencyIcon');
    const title    = document.getElementById('emergencyTitle');
    const subtitle = document.getElementById('emergencySubtitle');

    if (!emergencyActive) {
        emergencyActive = true;
        btn.classList.add('active');
        icon.textContent = '🚨';
        icon.classList.add('bounce');
        title.textContent = t('alarmActive');
        subtitle.innerHTML = '📍 Location Shared | 📞 Contacts Alerted';
        playAlarm();
        setTimeout(() => {
            alert(currentLanguage === 'en'
                ? 'Emergency alert sent to contacts!'
                : 'आपातकालीन सतर्कता संपर्कों को भेजी गई!');
        }, 300);
    } else {
        emergencyActive = false;
        btn.classList.remove('active');
        icon.textContent = '⚠️';
        icon.classList.remove('bounce');
        title.textContent = t('activateEmergency');
        subtitle.textContent = 'Tap & Hold for 3 Seconds';
    }
}

/* ============================================================
   FLASHLIGHT
   ============================================================ */
function toggleFlashlight() {
    flashlightOn = !flashlightOn;
    const btn = document.getElementById('flashlightBtn');
    if (flashlightOn) {
        btn.classList.add('active');
        document.body.style.filter = 'brightness(2)';
    } else {
        btn.classList.remove('active');
        document.body.style.filter = 'brightness(1)';
    }
}

/* ============================================================
   LOCATION SHARING
   ============================================================ */
function toggleLocationSharing() {
    locationShared = !locationShared;
    const locationStatus = document.getElementById('locationStatus');
    const locationText   = document.getElementById('locationText');

    if (locationShared) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    locationText.textContent = t('stopSharing');
                    locationStatus.style.display = 'block';
                },
                () => {
                    alert(currentLanguage === 'en'
                        ? 'Unable to access location'
                        : 'स्थान तक पहुंचने में असमर्थ');
                    locationShared = false;
                }
            );
        }
    } else {
        locationText.textContent = t('shareLocation');
        locationStatus.style.display = 'none';
    }
}

/* ============================================================
   CHAT MODAL
   ============================================================ */
function openChat() {
    document.getElementById('chatModal').classList.add('active');
}

function closeChat() {
    document.getElementById('chatModal').classList.remove('active');
}

function sendMessage() {
    const input            = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');

    if (!input.value.trim()) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `<div class="chat-bubble">${input.value}</div>`;
    messagesContainer.appendChild(userMsg);

    if (messagesContainer.classList.contains('empty')) {
        messagesContainer.classList.remove('empty');
    }

    // Bot response
    const responses    = t('chatResponses');
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
        const assistantMsg = document.createElement('div');
        assistantMsg.className = 'chat-message assistant';
        assistantMsg.innerHTML = `<div class="chat-bubble">${randomResponse}</div>`;
        messagesContainer.appendChild(assistantMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.querySelector(`[data-page="${pageId}"]`);
    if (navBtn) navBtn.classList.add('active');
}

/* ============================================================
   GOOGLE MAPS — initMap (called by Maps API callback)
   ============================================================ */
function initMap() {
    // Default center: India (fallback if geolocation denied)
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
    });

    // Initialize services
    directionsService  = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: { strokeColor: '#ec4899', strokeWeight: 5 }
    });
    placesService = new google.maps.places.PlacesService(map);

    // Auto-detect user location on map init
    getUserLocation();
}

/* ============================================================
   GOOGLE MAPS — getUserLocation
   ============================================================ */
function getUserLocation(callback) {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            hideLoading();
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLatLng = new google.maps.LatLng(lat, lng);

            // Center map on user
            map.setCenter(userLatLng);
            map.setZoom(15);

            // Place or update "You are here" yellow marker
            if (userMarker) userMarker.setMap(null);
            userMarker = new google.maps.Marker({
                position: userLatLng,
                map,
                title: 'You are here',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#FBBF24',    // Yellow
                    fillOpacity: 1,
                    strokeColor: '#92400e',
                    strokeWeight: 2
                },
                label: { text: '📍', fontSize: '20px' },
                zIndex: 999
            });

            if (typeof callback === 'function') callback();
        },
        (error) => {
            hideLoading();
            let msg = 'Location access denied. Please enable location permissions.';
            if (error.code === error.TIMEOUT)              msg = 'Location request timed out.';
            if (error.code === error.POSITION_UNAVAILABLE) msg = 'Location unavailable.';
            alert('⚠️ ' + msg);
            console.error('Geolocation error:', error);
        },
        { timeout: 10000, maximumAge: 60000 }
    );
}

/* ============================================================
   GOOGLE MAPS — searchNearby
   type: 'hospital' | 'police' | 'safe_zone'
   ============================================================ */
function searchNearby(type) {
    if (!map) { alert('Map is still loading, please wait a moment.'); return; }

    navigateTo('routesPage');

    // Smooth scroll to map
    setTimeout(() => {
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    // Clear previous state
    clearMarkers();
    directionsRenderer.setDirections({ routes: [] });
    document.getElementById('route-info').classList.remove('visible');

    // Marker colour per type
    const markerColors = {
        hospital:  '#DC2626',   // Red
        police:    '#2563EB',   // Blue
        safe_zone: '#16A34A'    // Green
    };

    const doSearch = () => {
        showLoading();

        let request;
        if (type === 'safe_zone') {
            request = {
                location: userLatLng,
                radius: 5000,
                keyword: 'women help center OR shelter OR safe zone OR ngo women'
            };
        } else {
            request = {
                location: userLatLng,
                radius: 5000,
                type: type
            };
        }

        placesService.nearbySearch(request, (results, status) => {
            hideLoading();

            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                renderResults(results, markerColors[type] || '#EC4899');
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                showNoResults();
            } else {
                console.error('Places API error:', status);
                showNoResults('⚠️ Could not fetch results. Check your API key and quota.');
            }
        });
    };

    if (userLatLng) {
        doSearch();
    } else {
        getUserLocation(doSearch);
    }
}

/* ============================================================
   GOOGLE MAPS — renderResults
   ============================================================ */
function renderResults(places, markerColor) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    places.forEach((place, i) => {
        // Coloured map marker
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: markerColor,
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            label: { text: String(i + 1), color: '#fff', fontSize: '11px', fontWeight: 'bold' }
        });

        // Info window on click
        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${place.name}</strong><br>${place.vicinity || ''}`
        });
        marker.addListener('click', () => infoWindow.open(map, marker));
        activeMarkers.push(marker);

        // Result card
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        const rating  = place.rating ? `⭐ ${place.rating} / 5` : 'No rating';
        const address = place.vicinity || 'Address unavailable';

        const card = document.createElement('div');
        card.className = 'result-item';
        card.innerHTML = `
            <div class="result-name">${i + 1}. ${place.name}</div>
            <div class="result-address">📍 ${address}</div>
            <div class="result-rating">${rating}</div>
            <a class="result-link" href="${mapsUrl}" target="_blank" rel="noopener">
                🗺️ Open in Google Maps →
            </a>
        `;
        resultsDiv.appendChild(card);
    });
}

/* ============================================================
   GOOGLE MAPS — clearMarkers
   ============================================================ */
function clearMarkers() {
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers = [];
}

/* ============================================================
   GOOGLE MAPS — toggleDestinationRow
   ============================================================ */
function toggleDestinationRow() {
    destinationRowVisible = !destinationRowVisible;
    const row = document.getElementById('destination-row');
    if (destinationRowVisible) {
        row.classList.add('visible');
        document.getElementById('destinationInput').focus();
        setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    } else {
        row.classList.remove('visible');
    }
}

/* ============================================================
   GOOGLE MAPS — showDirections
   ============================================================ */
function showDirections() {
    const destination = document.getElementById('destinationInput').value.trim();
    if (!destination) {
        alert('Please enter a destination address.');
        return;
    }

    if (!userLatLng) {
        alert('Getting your location first…');
        getUserLocation(() => showDirections());
        return;
    }

    clearMarkers();
    showLoading();

    const request = {
        origin:     userLatLng,
        destination: destination,
        travelMode:  google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        hideLoading();

        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            const leg = result.routes[0].legs[0];
            document.getElementById('routeDistance').textContent = leg.distance.text;
            document.getElementById('routeDuration').textContent = leg.duration.text;
            document.getElementById('route-info').classList.add('visible');

            document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });

            document.getElementById('results').innerHTML = `
                <div class="result-item">
                    <div class="result-name">🏁 Route to: ${destination}</div>
                    <div class="result-address">📏 ${leg.distance.text} &nbsp;|&nbsp; ⏱ ${leg.duration.text}</div>
                    <a class="result-link"
                       href="https://www.google.com/maps/dir/?api=1&origin=${userLatLng.lat()},${userLatLng.lng()}&destination=${encodeURIComponent(destination)}"
                       target="_blank" rel="noopener">
                       🗺️ Open full directions in Google Maps →
                    </a>
                </div>`;
        } else {
            console.error('Directions error:', status);
            alert('⚠️ Could not find a route. Please check the destination and try again.');
        }
    });
}

/* ============================================================
   GOOGLE MAPS — showLoading / hideLoading
   ============================================================ */
function showLoading() {
    document.getElementById('map-spinner').classList.add('visible');
}
function hideLoading() {
    document.getElementById('map-spinner').classList.remove('visible');
}

/* ============================================================
   GOOGLE MAPS — showNoResults
   ============================================================ */
function showNoResults(msg) {
    document.getElementById('results').innerHTML =
        `<div class="no-results-msg">${msg || '😔 No results found nearby. Try a different category.'}</div>`;
}

/* ============================================================
   INIT — runs after DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();

    // Allow Enter key in destination input
    const inp = document.getElementById('destinationInput');
    if (inp) {
        inp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') showDirections();
        });
    }

    // Allow Enter key in chat input
    const chatInp = document.getElementById('chatInput');
    if (chatInp) {
        chatInp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});