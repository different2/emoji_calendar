// My Health Log Calendar - Renderer Process
// No Node.js imports allowed in renderer with contextIsolation

// Initialize global variables first
let currentDate = new Date();
let selectedDate = null;
let selectedCategory = '';
let editingJournalDate = null;
let journalEntries = {};

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
    console.log('DOM loaded, initializing health log calendar...');
    loadJournalEntries();
    renderCalendar();
    setupEventListeners();
    
    setTimeout(() => {
        console.log('=== JOURNAL ENTRIES CHECK AFTER LOAD ===');
        console.log('Total journal entries loaded:', journalEntries);
        console.log('Entry count:', Object.keys(journalEntries).length);
    }, 1000);
});

function setupEventListeners() {
    document.addEventListener('keydown', function(event) {
        if (event.metaKey || event.ctrlKey) {
            switch(event.key) {
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
                case 'e':
                    event.preventDefault();
                    console.log('Keyboard shortcut for export triggered');
                    fallbackExport();
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            closeJournalPanel();
        }
    });
}

function selectDate(date, element) {
    console.log('=== DATE SELECTION ===');
    console.log('Clicked date object:', date);
    console.log('Date string:', date.toDateString());
    
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log('Selected date set to:', selectedDate);
    
    openJournalPanel();
}

function openJournalPanel() {
    const panel = document.getElementById('journalPanel');
    const title = document.getElementById('journalPanelTitle');
    const dateDisplay = document.getElementById('selectedDateDisplay');
    const deleteBtn = document.getElementById('deleteJournalBtn');
    
    panel.classList.remove('hidden');
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
    
    const dateKey = formatDateKey(selectedDate);
    const existingEntry = journalEntries[dateKey];
    
    if (existingEntry) {
        title.textContent = 'Health Log';
        deleteBtn.style.display = 'inline-block';
        loadJournalIntoPanel(existingEntry);
        editingJournalDate = dateKey;
    } else {
        title.textContent = 'Health Log';
        deleteBtn.style.display = 'none';
        clearJournalForm();
        editingJournalDate = null;
    }
    
    refreshEntriesList();
    updateQuickStats();
}

function closeJournalPanel() {
    const panel = document.getElementById('journalPanel');
    panel.classList.add('hidden');
    
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    selectedDate = null;
    editingJournalDate = null;
}

function setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('entryTime').value = timeString;
}

function selectCategory(emoji, categoryName) {
    selectedCategory = `${emoji} ${categoryName}`;
    
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    document.getElementById('customCategory').value = '';
}

function addLogEntry() {
    const time = document.getElementById('entryTime').value;
    const details = document.getElementById('entryDetails').value.trim();
    const customCategory = document.getElementById('customCategory').value.trim();
    
    if (!time || !details) {
        alert('Please enter both time and details for the log entry');
        return;
    }
    
    let category = customCategory || selectedCategory || '📝 Note';
    const dateKey = formatDateKey(selectedDate);
    
    if (!journalEntries[dateKey]) {
        journalEntries[dateKey] = {
            date: selectedDate.toISOString(),
            logEntries: [],
            dailyNotes: '',
            timestamp: new Date().toLocaleString(),
            lastModified: new Date().toISOString()
        };
    }
    
    const logEntry = {
        id: Date.now(),
        time: time,
        category: category,
        details: details,
        timestamp: new Date().toLocaleString()
    };
    
    journalEntries[dateKey].logEntries.push(logEntry);
    
    saveJournalEntries();
    renderCalendar();
    refreshEntriesList();
    updateQuickStats();
    
    document.getElementById('entryTime').value = '';
    document.getElementById('entryDetails').value = '';
    document.getElementById('customCategory').value = '';
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    selectedCategory = '';
    
    const addBtn = event.target;
    const originalText = addBtn.textContent;
    addBtn.textContent = 'Added ✓';
    addBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
        addBtn.textContent = originalText;
        addBtn.style.background = '';
    }, 1500);
}

function refreshEntriesList() {
    const entriesList = document.getElementById('entriesList');
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (!dayData || !dayData.logEntries || dayData.logEntries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries-message">No entries for this day yet.</p>';
        return;
    }
    
    const sortedEntries = [...dayData.logEntries].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
    
    entriesList.innerHTML = '';
    
    sortedEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry';
        
        entryDiv.innerHTML = `
            <div class="log-entry-header">
                <span class="log-entry-time">${entry.time}</span>
                <span class="log-entry-category">${entry.category}</span>
            </div>
            <div class="log-entry-details">${entry.details}</div>
            <div class="log-entry-actions">
                <button class="log-entry-btn delete" onclick="deleteLogEntry(${entry.id})">Delete</button>
            </div>
        `;
        
        entriesList.appendChild(entryDiv);
    });
}

function deleteLogEntry(entryId) {
    if (!confirm('Delete this log entry?')) return;
    
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (dayData && dayData.logEntries) {
        dayData.logEntries = dayData.logEntries.filter(entry => entry.id !== entryId);
        saveJournalEntries();
        renderCalendar();
        refreshEntriesList();
        updateQuickStats();
    }
}

function updateQuickStats() {
    const quickStats = document.getElementById('quickStats');
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (!dayData || !dayData.logEntries || dayData.logEntries.length === 0) {
        quickStats.innerHTML = '<span class="stat-item">No entries today</span>';
        return;
    }
    
    const categoryCount = {};
    dayData.logEntries.forEach(entry => {
        const category = entry.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    quickStats.innerHTML = '';
    Object.entries(categoryCount).forEach(([category, count]) => {
        const statItem = document.createElement('span');
        statItem.className = 'stat-item';
        statItem.textContent = `${category}: ${count}`;
        quickStats.appendChild(statItem);
    });
}

function loadJournalIntoPanel(entry) {
    document.getElementById('dailyNotes').value = entry.dailyNotes || '';
    refreshEntriesList();
    updateQuickStats();
}

function clearJournalForm() {
    document.getElementById('entryTime').value = '';
    document.getElementById('entryDetails').value = '';
    document.getElementById('customCategory').value = '';
    document.getElementById('dailyNotes').value = '';
    
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('selected');
    });
    selectedCategory = '';
    
    refreshEntriesList();
    updateQuickStats();
}

async function saveJournalEntry() {
    const dailyNotes = document.getElementById('dailyNotes').value.trim();
    const dateKey = formatDateKey(selectedDate);
    
    if (!journalEntries[dateKey]) {
        journalEntries[dateKey] = {
            date: selectedDate.toISOString(),
            logEntries: [],
            dailyNotes: '',
            timestamp: new Date().toLocaleString(),
            lastModified: new Date().toISOString()
        };
    }
    
    journalEntries[dateKey].dailyNotes = dailyNotes;
    journalEntries[dateKey].lastModified = new Date().toISOString();
    
    await saveJournalEntries();
    renderCalendar();
    
    document.getElementById('journalPanelTitle').textContent = 'Health Log';
    document.getElementById('deleteJournalBtn').style.display = 'inline-block';
    editingJournalDate = dateKey;
    
    const saveBtn = document.querySelector('.journal-actions .btn-primary');
    const originalText = saveBtn.textContent;
    saveBtn.style.background = '#4CAF50';
    saveBtn.textContent = 'Saved ✓';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 1500);
}

async function deleteJournalEntry() {
    if (!selectedDate) return;
    
    if (confirm('Are you sure you want to delete ALL entries for this day? This cannot be undone.')) {
        const dateKey = formatDateKey(selectedDate);
        delete journalEntries[dateKey];
        
        await saveJournalEntries();
        renderCalendar();
        closeJournalPanel();
    }
}

async function saveJournalEntries() {
    try {
        if (window.electronAPI) {
            const result = await window.electronAPI.saveEvents(journalEntries);
            if (!result.success) {
                console.error('Failed to save journal entries:', result.error);
                alert('Failed to save journal data. Please try again.');
            } else {
                console.log('Journal entries saved successfully');
            }
        } else {
            console.warn('electronAPI not available, cannot save journal entries');
        }
    } catch (error) {
        console.error('Error saving journal entries:', error);
        alert('Error saving journal data. Please try again.');
    }
}

async function loadJournalEntries() {
    try {
        if (window.electronAPI) {
            const result = await window.electronAPI.loadEvents();
            if (result.success) {
                journalEntries = result.events || {};
                console.log('Journal entries loaded successfully:', journalEntries);
            } else {
                console.error('Failed to load journal entries:', result.error);
                journalEntries = {};
            }
        } else {
            console.warn('electronAPI not available, using empty journal entries');
            journalEntries = {};
        }
    } catch (error) {
        console.error('Error loading journal entries:', error);
        journalEntries = {};
    }
}

function renderCalendar() {
    console.log('=== RENDERING CALENDAR ===');
    console.log('Current date being rendered:', currentDate);
    console.log('All journal entries in memory:', journalEntries);
    
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
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    
    calendar.innerHTML = '';
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    const currentDateCopy = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
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
        console.log('Checking journal entries for date key:', dateKey);
        
        if (journalEntries[dateKey]) {
            console.log('Found journal entry for', dateKey);
            
            const journal = journalEntries[dateKey];
            
            if (journal.logEntries && journal.logEntries.length > 0) {
                const categoryEmojis = new Set();
                journal.logEntries.forEach(entry => {
                    if (entry.category) {
                        const emoji = entry.category.split(' ')[0];
                        categoryEmojis.add(emoji);
                    }
                });
                
                if (categoryEmojis.size > 0) {
                    const journalEmojis = document.createElement('span');
                    journalEmojis.className = 'event-emojis-only';
                    journalEmojis.textContent = Array.from(categoryEmojis).join('');
                    
                    const entryCount = document.createElement('span');
                    entryCount.className = 'entry-count';
                    entryCount.textContent = `${journal.logEntries.length}`;
                    entryCount.style.fontSize = '10px';
                    entryCount.style.color = '#666';
                    entryCount.style.marginLeft = '2px';
                    
                    const wrapper = document.createElement('div');
                    wrapper.appendChild(journalEmojis);
                    wrapper.appendChild(entryCount);
                    
                    dayEvents.appendChild(wrapper);
                    console.log('Added category emojis to calendar');
                }
            }
        } else {
            console.log('No journal entry found for', dateKey);
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

function goToToday() {
    currentDate = new Date();
    renderCalendar();
    
    setTimeout(() => {
        const todayElement = document.querySelector('.day.today');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
    if (confirm('Are you sure you want to clear all journal data? This cannot be undone.')) {
        journalEntries = {};
        await saveJournalEntries();
        renderCalendar();
        console.log('All journal data cleared');
    }
}

function fallbackExport() {
    try {
        console.log('=== FALLBACK EXPORT STARTED ===');
        console.log('Current journal entries to export:', journalEntries);
        
        if (!journalEntries || Object.keys(journalEntries).length === 0) {
            console.log('No journal entries to export');
            alert('No journal entries to export!');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            type: 'health-journal',
            entries: journalEntries
        };
        
        console.log('Export data prepared:', exportData);
        
        const dataStr = JSON.stringify(exportData, null, 2);
        console.log('JSON string created, length:', dataStr.length);
        
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        console.log('Blob created:', dataBlob);
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `health-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        console.log('Download link created:', link.href);
        console.log('Download filename:', link.download);
        
        document.body.appendChild(link);
        console.log('Link added to DOM');
        
        link.click();
        console.log('Download link clicked');
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            console.log('Download link cleaned up');
        }, 1000);
        
        alert(`Journal exported successfully!\nFile: ${link.download}\nCheck your Downloads folder.`);
        console.log('=== FALLBACK EXPORT COMPLETED ===');
        
    } catch (error) {
        console.error('=== FALLBACK EXPORT FAILED ===');
        console.error('Error details:', error);
        alert(`Fallback export failed: ${error.message}`);
    }
}

function triggerDirectExport() {
    console.log('Triggering direct export...');
    fallbackExport();
}