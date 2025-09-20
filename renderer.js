const { ipcRenderer } = require('electron');let currentDate = new Date();
let selectedDate = null;
let selectedEmoji = '📅';
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

// Initialize calendar
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
                console.log('Events loaded successfully');
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
                    ipcRenderer.send('new-event');
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
        
        if (event.key === 'Escape' && modal.style.display === 'block') {
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
    selectedEmoji = emoji;
    document.getElementById('selectedEmojiDisplay').textContent = emoji;
    
    // Update visual selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent === emoji);
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
    console.log('Rendering calendar for:', currentDate);
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    
    if (!calendar || !monthYear) {
        console.error('Calendar elements not found');
        return;
    }
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
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
        if (events[dateKey]) {
            events[dateKey].forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                
                const eventEmoji = document.createElement('span');
                eventEmoji.className = 'event-emoji';
                eventEmoji.textContent = event.emoji;
                
                const eventTitle = document.createElement('span');
                eventTitle.className = 'event-title';
                let titleText = event.title;
                if (event.time) {
                    titleText = `${event.time} ${titleText}`;
                }
                eventTitle.textContent = titleText;
                
                eventElement.appendChild(eventEmoji);
                eventElement.appendChild(eventTitle);
                
                eventElement.onclick = (e) => {
                    e.stopPropagation();
                    editEvent(dateKey, event.id);
                };
                dayEvents.appendChild(eventElement);
            });
        }
        
        dayElement.appendChild(dayNumber);
        dayElement.appendChild(dayEvents);
        
        dayElement.onclick = () => selectDate(currentDateCopy, dayElement);
        
        calendar.appendChild(dayElement);
        currentDateCopy.setDate(currentDateCopy.getDate() + 1);
    }
    
    console.log('Calendar rendered successfully');
}

function selectDate(date, element) {
    // Remove previous selection
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    element.classList.add('selected');
    selectedDate = new Date(date);
    
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
        selectedEmoji = '📅';
        document.getElementById('selectedEmojiDisplay').textContent = selectedEmoji;
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
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    const eventData = {
        id: editingEventId || Date.now(),
        title: title,
        emoji: selectedEmoji,
        time: time,
        notes: notes,
        timestamp: new Date().toLocaleString()
    };
    
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
    
    await saveEvents();
    renderCalendar();
    closeModal();
}

function editEvent(dateKey, eventId) {
    const event = events[dateKey].find(e => e.id === eventId);
    if (!event) return;
    
    // Parse the date key back to a date
    const [year, month, day] = dateKey.split('-').map(Number);
    selectedDate = new Date(year, month, day);
    editingEventId = eventId;
    
    // Fill form with event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventNotes').value = event.notes || '';
    selectedEmoji = event.emoji;
    document.getElementById('selectedEmojiDisplay').textContent = selectedEmoji;
    
    // Update emoji selection in grid
    populateEmojiGrid(currentCategory);
    setTimeout(() => {
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.textContent === selectedEmoji);
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
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}