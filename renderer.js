// My Calendar App - Renderer Process
// No Node.js imports allowed in renderer with contextIsolation

// Initialize global variables
let currentDate = new Date();
let selectedDate = null;
let selectedEmojis = []; // Remove default 📅 emoji
let editingEventId = null;
let events = {};
let currentCategory = 'all';

// Comprehensive emoji database organized by categories
const emojiDatabase = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
    people: ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👱‍♂️', '👨‍🦰', '👨‍🦱', '👨‍🦳', '👨‍🦲', '👩', '👱‍♀️', '👩‍🦰', '👩‍🦱', '👩‍🦳', '👩‍🦲', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️'],
    nature: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🌱', '🌿', '🍀', '🎋', '🌾', '🌵', '🌲', '🌳', '🌴', '🌻', '🌺', '🌸', '🌼', '🌷'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🎂', '🍰', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏃', '🚶', '🧎', '🧍', '🤳', '💃', '🕺', '👯', '🕴', '🚣', '🏊', '🚴', '🚵', '🤹', '🧗', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥇', '🥈', '🥉', '🏆', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎯', '🎳', '🎮', '🎰', '🧩'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩', '🛫', '🛬', '🪂', '💺', '🚀', '🛰', '🚉', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚟', '🚠', '🚡', '⛴', '🚢', '⛵', '🚤', '🛥', '🛶', '⚓', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🕍', '🛕'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🪅', '🪆', '📝', '📃', '📄', '📑', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱', '™️', '©️', '®️', '👁‍🗨', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
};

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calendar...');
    loadEvents();
    renderCalendar();
    setupEventListeners();
    populateEmojiGrid('all');
});

// IPC event listeners for menu actions (with error handling)
if (window.electronAPI) {
    window.electronAPI.onNewEvent(() => {
        const today = new Date();
        selectedDate = today;
        
        // Highlight today's date
        document.querySelectorAll('.day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        const todayElement = document.querySelector('.day.today');
        if (todayElement) {
            todayElement.classList.add('selected');
        }
        
        openModal();
    });

    window.electronAPI.onPrevMonth(() => {
        prevMonth();
    });

    window.electronAPI.onNextMonth(() => {
        nextMonth();
    });

    window.electronAPI.onGoToToday(() => {
        goToToday();
    });

    window.electronAPI.onClearAllData(() => {
        clearAllData();
    });
}

// Data persistence functions
async function saveEvents() {
    try {
        if (window.electronAPI) {
            const result = await window.electronAPI.saveEvents(events);
            if (!result.success) {
                console.error('Failed to save events:', result.error);
                alert('Failed to save calendar data. Please try again.');
            } else {
                console.log('Events saved successfully');
            }
        } else {
            console.warn('electronAPI not available, cannot save events');
        }
    } catch (error) {
        console.error('Error saving events:', error);
        alert('Error saving calendar data. Please try again.');
    }
}

async function loadEvents() {
    try {
        if (window.electronAPI) {
            const result = await window.electronAPI.loadEvents();
            if (result.success) {
                events = result.events || {};
                
                // Migrate old date key format to new format
                const migratedEvents = {};
                for (const [dateKey, eventList] of Object.entries(events)) {
                    if (dateKey.includes('-') && dateKey.split('-').length === 3 && dateKey.split('-')[1].length === 2) {
                        // Already in new format
                        migratedEvents[dateKey] = eventList;
                    } else {
                        // Old format: convert to new format
                        const parts = dateKey.split('-').map(Number);
                        if (parts.length === 3) {
                            const year = parts[0];
                            const month = String(parts[1] + 1).padStart(2, '0'); // Convert from 0-indexed to 1-indexed
                            const day = String(parts[2]).padStart(2, '0');
                            const newKey = `${year}-${month}-${day}`;
                            migratedEvents[newKey] = eventList;
                            console.log('Migrated event from', dateKey, 'to', newKey);
                        }
                    }
                }
                
                events = migratedEvents;
                console.log('Events loaded successfully:', events);
                
                // Save the migrated data
                if (Object.keys(migratedEvents).length > 0) {
                    await saveEvents();
                }
            } else {
                console.error('Failed to load events:', result.error);
                events = {};
            }
        } else {
            console.warn('electronAPI not available, using empty events');
            events = {};
        }
    } catch (error) {
        console.error('Error loading events:', error);
        events = {};
    }
}

function setupEventListeners() {
    // Close modal when clicking outside or on close button
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = closeModal;
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            populateEmojiGrid(currentCategory);
        };
    });

    // Emoji search
    document.getElementById('emojiSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        populateEmojiGrid(currentCategory, searchTerm);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.metaKey || event.ctrlKey) {
            switch(event.key) {
                case 'n':
                    event.preventDefault();
                    if (window.electronAPI) {
                        const today = new Date();
                        selectedDate = today;
                        openModal();
                    }
                    break;
                case 't':
                    event.preventDefault();
                    goToToday();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    prevMonth();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    nextMonth();
                    break;
            }
        }
        
        if (event.key === 'Escape' && document.getElementById('eventModal').style.display === 'block') {
            closeModal();
        }
    });
}

function populateEmojiGrid(category, searchTerm = '') {
    const emojiGrid = document.getElementById('emojiGrid');
    emojiGrid.innerHTML = '';
    
    let emojisToShow = [];
    
    if (category === 'all') {
        emojisToShow = Object.values(emojiDatabase).flat();
    } else {
        emojisToShow = emojiDatabase[category] || [];
    }
    
    // Filter by search term if provided
    if (searchTerm) {
        // For now, just show all emojis - you could add emoji names/descriptions for better search
        emojisToShow = emojisToShow.filter(emoji => {
            return true; // Placeholder for search functionality
        });
    }
    
    emojisToShow.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-btn';
        btn.textContent = emoji;
        btn.onclick = function() {
            selectEmoji(emoji);
        };
        emojiGrid.appendChild(btn);
    });
}

function selectEmoji(emoji) {
    // Toggle emoji in the selected list
    const emojiIndex = selectedEmojis.indexOf(emoji);
    
    if (emojiIndex > -1) {
        // Remove emoji if already selected
        selectedEmojis.splice(emojiIndex, 1);
    } else {
        // Add emoji to selection
        selectedEmojis.push(emoji);
    }
    
    // Update display (no default emoji required)
    document.getElementById('selectedEmojiDisplay').textContent = selectedEmojis.length > 0 ? selectedEmojis.join(' ') : 'No emojis selected';
    
    // Update visual selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.toggle('selected', selectedEmojis.includes(btn.textContent));
    });
}

function setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('eventTime').value = timeString;
}

function goToToday() {
    currentDate = new Date();
    renderCalendar();
    
    // Highlight today
    setTimeout(() => {
        const todayElement = document.querySelector('.day.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function renderCalendar() {
    console.log('=== RENDERING CALENDAR ===');
    console.log('Current date being rendered:', currentDate);
    console.log('All events in memory:', events);
    
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    
    if (!calendar || !monthYear) {
        console.error('Calendar elements not found');
        return;
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    console.log('Rendering year:', year, 'month:', month, '(0-indexed)');
    
    monthYear.textContent = new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        year: 'numeric' 
    }).format(currentDate);
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Add days
    const currentDateCopy = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // Create a snapshot of the current date for this specific day
        const thisDayDate = new Date(currentDateCopy.getFullYear(), currentDateCopy.getMonth(), currentDateCopy.getDate());
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDateCopy.getDate();
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        
        if (currentDateCopy.getMonth() !== month) {
            dayElement.classList.add('other-month');
        } else if (
            currentDateCopy.getDate() === today.getDate() &&
            currentDateCopy.getMonth() === today.getMonth() &&
            currentDateCopy.getFullYear() === today.getFullYear()
        ) {
            dayElement.classList.add('today');
        }
        
        const dateKey = formatDateKey(currentDateCopy);
        console.log('Checking events for date key:', dateKey, 'Current date copy:', currentDateCopy);
        
        if (events[dateKey] && events[dateKey].length > 0) {
            console.log('Found', events[dateKey].length, 'events for', dateKey, ':', events[dateKey]);
            
            events[dateKey].forEach((event, index) => {
                console.log(`Processing event ${index}:`, event);
                
                // Only show emojis, no text or containers
                const eventEmojis = document.createElement('span');
                eventEmojis.className = 'event-emojis-only';
                
                // Display all emojis (backward compatibility)
                if (event.emojis && event.emojis.length > 0) {
                    eventEmojis.textContent = event.emojis.join('');
                    console.log('Using new emojis format:', event.emojis.join(''));
                } else if (event.emoji) {
                    eventEmojis.textContent = event.emoji; // Old format
                    console.log('Using old emoji format:', event.emoji);
                }
                
                // Click handler for editing
                eventEmojis.onclick = (e) => {
                    e.stopPropagation();
                    console.log('Clicked on event:', event);
                    editEvent(dateKey, event.id);
                };
                
                dayEvents.appendChild(eventEmojis);
                console.log('Added emoji-only event to calendar');
            });
        } else {
            console.log('No events found for', dateKey);
        }
        
        dayElement.appendChild(dayNumber);
        dayElement.appendChild(dayEvents);
        
        dayElement.onclick = () => {
            console.log('Day clicked - this day date:', thisDayDate.toDateString());
            console.log('Day clicked - date key will be:', formatDateKey(thisDayDate));
            selectDate(thisDayDate, dayElement);
        };
        
        calendar.appendChild(dayElement);
        currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    
    console.log('Calendar rendered successfully');
}

function selectDate(date, element) {
    console.log('=== DATE SELECTION ===');
    console.log('Clicked date object:', date);
    console.log('Date string:', date.toDateString());
    console.log('Date parts - Year:', date.getFullYear(), 'Month:', date.getMonth(), 'Day:', date.getDate());
    
    // Remove previous selection
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    element.classList.add('selected');
    
    // Create a clean copy of the date to avoid reference issues
    selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log('Selected date set to:', selectedDate);
    console.log('Selected date key will be:', formatDateKey(selectedDate));
    
    // Reset editing state for new event
    editingEventId = null;
    
    // Open modal for new event
    openModal();
}

function openModal(isEdit = false) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteBtn');
    
    modalTitle.textContent = isEdit ? 'Edit Event' : 'Add Event';
    deleteBtn.style.display = isEdit ? 'inline-block' : 'none';
    
    if (!isEdit) {
        // Clear form for new event
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventTime').value = '';
        document.getElementById('eventNotes').value = '';
        selectedEmojis = [];
        document.getElementById('selectedEmojiDisplay').textContent = 'No emojis selected';
        document.getElementById('emojiSearch').value = '';
        currentCategory = 'all';
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        populateEmojiGrid('all');
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventId = null;
}

async function saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const time = document.getElementById('eventTime').value;
    const notes = document.getElementById('eventNotes').value.trim();
    
    if (!title) {
        alert('Please enter an event title');
        return;
    }
    
    if (selectedEmojis.length === 0) {
        alert('Please select at least one emoji');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    console.log('Saving event for date key:', dateKey);
    console.log('Selected date:', selectedDate);
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    const eventData = {
        id: editingEventId || Date.now(),
        title: title,
        emojis: [...selectedEmojis], // Save array of emojis
        time: time,
        notes: notes,
        timestamp: new Date().toLocaleString()
    };
    
    console.log('Event data:', eventData);
    
    if (editingEventId) {
        // Update existing event
        const eventIndex = events[dateKey].findIndex(e => e.id === editingEventId);
        if (eventIndex !== -1) {
            events[dateKey][eventIndex] = eventData;
        }
    } else {
        // Add new event
        events[dateKey].push(eventData);
    }
    
    console.log('All events after save:', events);
    
    await saveEvents();
    renderCalendar();
    closeModal();
}

function editEvent(dateKey, eventId) {
    const event = events[dateKey].find(e => e.id === eventId);
    if (!event) return;
    
    // Parse the date key back to a date - handle both old and new formats
    let year, month, day;
    
    if (dateKey.includes('-') && dateKey.split('-').length === 3) {
        // New format: YYYY-MM-DD
        const parts = dateKey.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1; // Convert back to 0-indexed
        day = parseInt(parts[2]);
    } else {
        // Old format fallback
        const parts = dateKey.split('-').map(Number);
        year = parts[0];
        month = parts[1]; // Already 0-indexed in old format
        day = parts[2];
    }
    
    selectedDate = new Date(year, month, day);
    editingEventId = eventId;
    
    // Fill form with event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventNotes').value = event.notes || '';
    
    // Handle both new array format and old single emoji format
    if (event.emojis) {
        selectedEmojis = [...event.emojis];
    } else if (event.emoji) {
        selectedEmojis = [event.emoji];
    }
    
    document.getElementById('selectedEmojiDisplay').textContent = selectedEmojis.join(' ');
    
    // Update emoji selection in grid
    populateEmojiGrid(currentCategory);
    setTimeout(() => {
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.toggle('selected', selectedEmojis.includes(btn.textContent));
        });
    }, 100);
    
    openModal(true);
}

async function deleteEvent() {
    if (!editingEventId) return;
    
    const dateKey = formatDateKey(selectedDate);
    if (events[dateKey]) {
        events[dateKey] = events[dateKey].filter(e => e.id !== editingEventId);
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
    }
    
    await saveEvents();
    renderCalendar();
    closeModal();
}

function formatDateKey(date) {
    // Use a consistent format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear all calendar data? This cannot be undone.')) {
        events = {};
        await saveEvents();
        renderCalendar();
        console.log('All calendar data cleared');
    }
}