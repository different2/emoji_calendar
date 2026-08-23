// My Health Log Calendar - Renderer Process with Simplified Journal
// No Node.js imports allowed in renderer with contextIsolation

// Initialize global variables first
let currentDate = new Date();
let selectedDate = null;
let selectedEmoji = '📝';
let journalEntries = {};
let customEmojis = []; // Store custom emojis
let defaultEmojis = ['😴', '🌡️','😊', '📝']; // Default set

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing health log calendar...');
    loadJournalEntries().then(() => {
        loadCustomEmojis().then(() => {
            renderCalendar();
            setupEventListeners();
            setupEmojiButtons();
            setupWindowDragging(); // Add window dragging setup
            
            setTimeout(() => {
                console.log('=== INITIALIZATION COMPLETE ===');
                console.log('Total journal entries loaded:', journalEntries);
                console.log('Entry count:', Object.keys(journalEntries).length);
                console.log('Custom emojis loaded:', customEmojis);
            }, 1000);
        });
    });
});

// Window dragging functionality
function setupWindowDragging() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    // Get the main app container
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;
    
    // Add dragging capability to the entire app
    appContainer.addEventListener('mousedown', (e) => {
        // Don't start dragging if clicking on interactive elements
        const tagName = e.target.tagName.toLowerCase();
        const isInteractive = [
            'button', 'input', 'textarea', 'select', 'a', 'label'
        ].includes(tagName);
        
        const isInJournalPanel = e.target.closest('.journal-panel');
        const isInCalendarGrid = e.target.closest('.calendar-grid');
        const isButton = e.target.closest('button') || e.target.classList.contains('day');
        const isInput = e.target.closest('input, textarea, select');
        
        // Allow dragging from most areas except interactive elements
        if (isInteractive || isButton || isInput) {
            return;
        }
        
        // Special case: allow dragging from journal header area
        const isJournalHeader = e.target.closest('.journal-header');
        const isCalendarHeader = e.target.closest('.header');
        
        // Only allow dragging from headers, empty spaces, or non-interactive areas
        if (isInJournalPanel && !isJournalHeader) {
            return;
        }
        
        if (isInCalendarGrid) {
            return;
        }
        
        isDragging = true;
        startX = e.screenX;
        startY = e.screenY;
        
        // Change cursor to indicate dragging
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        // Notify main process
        if (window.electronAPI) {
            window.electronAPI.startWindowDrag(e.screenX, e.screenY);
        }
        
        e.preventDefault();
    });
    
    // Handle mouse move for dragging
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // Notify main process of mouse movement
        if (window.electronAPI) {
            window.electronAPI.moveWindow(e.screenX, e.screenY);
        }
        
        e.preventDefault();
    });
    
    // Handle mouse up to end dragging
    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Reset cursor and selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Notify main process
        if (window.electronAPI) {
            window.electronAPI.endWindowDrag();
        }
    });
    
    // Handle mouse leave to end dragging if mouse leaves window
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            if (window.electronAPI) {
                window.electronAPI.endWindowDrag();
            }
        }
    });
    
    // Add visual feedback for draggable areas
    const draggableAreas = [
        '.header',
        '.journal-header'
    ];
    
    draggableAreas.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (!isDragging) {
                    element.style.cursor = 'grab';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (!isDragging) {
                    element.style.cursor = '';
                }
            });
        });
    });
}

async function loadCustomEmojis() {
    try {
        if (window.electronAPI) {
            const result = await window.electronAPI.loadEvents();
            if (result.success && result.events && result.events._customEmojis) {
                customEmojis = result.events._customEmojis.customEmojis || [];
                console.log('Custom emojis loaded successfully:', customEmojis);
                
                // Clean up the custom emoji data from journal entries
                if (journalEntries._customEmojis) {
                    delete journalEntries._customEmojis;
                }
            } else {
                customEmojis = [];
                console.log('No custom emojis found, starting with empty array');
            }
        } else {
            console.warn('electronAPI not available, using empty custom emojis');
            customEmojis = [];
        }
    } catch (error) {
        console.error('Error loading custom emojis:', error);
        customEmojis = [];
    }
}

async function saveCustomEmojis() {
    try {
        if (window.electronAPI) {
            const customEmojiData = {
                customEmojis: customEmojis,
                lastModified: new Date().toISOString()
            };
            
            // Save custom emojis along with journal entries
            const result = await window.electronAPI.saveEvents({
                ...journalEntries,
                '_customEmojis': customEmojiData
            });
            
            if (!result.success) {
                console.error('Failed to save custom emojis:', result.error);
            } else {
                console.log('Custom emojis saved successfully');
            }
        } else {
            console.warn('electronAPI not available, cannot save custom emojis');
        }
    } catch (error) {
        console.error('Error saving custom emojis:', error);
    }
}

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
                case 'Enter':
                    event.preventDefault();
                    addLogEntry();
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            closeJournalPanel();
        }
    });
}

function renderEmojiButtons() {
    const emojiRow = document.querySelector('.emoji-row');
    if (!emojiRow) return;
    
    // Combine custom emojis with default emojis (custom first)
    const allEmojis = [...customEmojis, ...defaultEmojis];
    
    // Remove duplicates while preserving order (custom emojis take priority)
    const uniqueEmojis = [...new Set(allEmojis)];
    
    emojiRow.innerHTML = '';
    
    // Add emoji buttons
    uniqueEmojis.forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'emoji-btn';
        button.dataset.emoji = emoji;
        button.textContent = emoji;
        button.title = customEmojis.includes(emoji) ? 'Custom emoji' : getEmojiTitle(emoji);
        
        // Add custom styling for custom emojis
        if (customEmojis.includes(emoji)) {
            button.classList.add('custom-emoji');
            button.title += ' (Right-click to remove)';
        }
        
        emojiRow.appendChild(button);
    });
    
    // Add custom emoji input
    const addEmojiContainer = document.createElement('div');
    addEmojiContainer.className = 'add-emoji-container';
    addEmojiContainer.innerHTML = `
        <input type="text" class="custom-emoji-input" placeholder="Paste emoji here..." maxlength="2">
        <button class="add-custom-emoji-btn" onclick="addCustomEmoji()" title="Add custom emoji">➕</button>
    `;
    
    emojiRow.appendChild(addEmojiContainer);
    
    // Setup input event listener
    const customInput = addEmojiContainer.querySelector('.custom-emoji-input');
    customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addCustomEmoji();
        }
    });
    
    customInput.addEventListener('paste', (e) => {
        // Auto-add emoji after paste with slight delay
        setTimeout(() => {
            const value = e.target.value.trim();
            if (value && isEmoji(value)) {
                addCustomEmojiFromInput(value);
            }
        }, 100);
    });
}

function getEmojiTitle(emoji) {
    const titles = {
        '💊': 'Medication',
        '🍽️': 'Food/Meal',
        '💧': 'Drink/Water',
        '🚽': 'Bathroom',
        '😴': 'Sleep/Rest',
        '🌡️': 'Symptoms',
        '🚶‍♀️': 'Activity',
        '😷': 'Medical',
        '😊': 'Mood',
        '📝': 'Note'
    };
    return titles[emoji] || 'Custom';
}

function isEmoji(str) {
    // Comprehensive emoji detection - covers all Unicode emoji ranges
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    
    // Alternative method: try to detect if string contains emoji characters
    // This catches most modern emojis including food emojis like 🥑
    const hasEmoji = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/u;
    
    // Check if it's likely an emoji (not just regular text)
    const isLikelyEmoji = hasEmoji.test(str) || emojiRegex.test(str);
    
    // Additional check: if string length is 1-4 characters and contains Unicode above normal ASCII
    const hasUnicode = /[^\x00-\x7F]/.test(str);
    const isShort = str.length >= 1 && str.length <= 4;
    
    return isLikelyEmoji || (hasUnicode && isShort && str.trim().length > 0);
}

function addCustomEmoji() {
    const input = document.querySelector('.custom-emoji-input');
    if (!input) return;
    
    const emoji = input.value.trim();
    addCustomEmojiFromInput(emoji);
    input.value = '';
}

function addCustomEmojiFromInput(emoji) {
    if (!emoji) {
        alert('Please enter an emoji');
        return;
    }
    
    if (!isEmoji(emoji)) {
        alert('Please enter a valid emoji (not text)');
        return;
    }
    
    // Check if emoji already exists
    if (customEmojis.includes(emoji) || defaultEmojis.includes(emoji)) {
        alert('This emoji is already in your collection');
        return;
    }
    
    // Add to custom emojis at the beginning
    customEmojis.unshift(emoji);
    
    // Limit to 20 custom emojis
    if (customEmojis.length > 20) {
        customEmojis = customEmojis.slice(0, 20);
    }
    
    saveCustomEmojis();
    renderEmojiButtons();
    setupEmojiButtons();
    
    // Select the new emoji
    setTimeout(() => {
        const newEmojiBtn = document.querySelector(`[data-emoji="${emoji}"]`);
        if (newEmojiBtn) {
            newEmojiBtn.click();
        }
    }, 100);
}

function removeCustomEmoji(emoji) {
    customEmojis = customEmojis.filter(e => e !== emoji);
    saveCustomEmojis();
    renderEmojiButtons();
    setupEmojiButtons();
    
    // If this was the selected emoji, select the first available emoji
    if (selectedEmoji === emoji) {
        const firstBtn = document.querySelector('.emoji-btn');
        if (firstBtn) {
            firstBtn.click();
        }
    }
}

function setupEmojiButtons() {
    // Wait for panel to be available, then setup emoji buttons
    const checkForPanel = () => {
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        
        if (emojiButtons.length > 0) {
            emojiButtons.forEach(btn => {
                // Remove existing listeners to prevent duplicates
                btn.replaceWith(btn.cloneNode(true));
            });
            
            // Re-select the buttons after cloning
            const refreshedButtons = document.querySelectorAll('.emoji-btn');
            
            refreshedButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove selected class from all buttons
                    refreshedButtons.forEach(b => b.classList.remove('selected'));
                    
                    // Add selected class to clicked button
                    this.classList.add('selected');
                    
                    // Update selected emoji
                    selectedEmoji = this.dataset.emoji;
                    const display = document.getElementById('selectedEmoji');
                    if (display) {
                        display.textContent = selectedEmoji;
                    }
                    
                    // Auto-focus on note input
                    setTimeout(() => {
                        const noteInput = document.getElementById('noteInput');
                        if (noteInput) {
                            noteInput.focus();
                        }
                    }, 100);
                });
                
                // Re-add context menu for custom emojis
                if (customEmojis.includes(btn.dataset.emoji)) {
                    btn.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        if (confirm(`Remove custom emoji "${btn.dataset.emoji}" from your collection?`)) {
                            removeCustomEmoji(btn.dataset.emoji);
                        }
                    });
                }
            });
            
            // Select the first emoji by default if none selected
            const selectedBtn = document.querySelector('.emoji-btn.selected');
            if (!selectedBtn && refreshedButtons[0]) {
                refreshedButtons[0].click();
            }
        } else {
            // Panel not ready yet, try again
            setTimeout(checkForPanel, 100);
        }
    };
    
    checkForPanel();
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
    
    panel.classList.remove('hidden');
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateDisplay.textContent = selectedDate.toLocaleDateString('en-US', options);
    title.textContent = 'Daily Log';
    
    // Render emoji buttons with custom emojis
    renderEmojiButtons();
    
    // Setup emoji buttons when panel opens
    setTimeout(setupEmojiButtons, 100);
    
    refreshEntriesList();
}

function closeJournalPanel() {
    const panel = document.getElementById('journalPanel');
    panel.classList.add('hidden');
    
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    selectedDate = null;
}

function setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const timeInput = document.getElementById('entryTime');
    if (timeInput) {
        timeInput.value = timeString;
    }
}

function addLogEntry() {
    const timeInput = document.getElementById('entryTime');
    const noteInput = document.getElementById('noteInput');
    
    if (!timeInput || !noteInput || !selectedDate) {
        console.warn('Required elements not found or no date selected');
        return;
    }
    
    const time = timeInput.value;
    const note = noteInput.value.trim();
    
    if (!time || !note) {
        alert('Please enter both time and note');
        return;
    }
    
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
        category: selectedEmoji,
        details: note,
        timestamp: new Date().toLocaleString()
    };
    
    journalEntries[dateKey].logEntries.push(logEntry);
    
    // Sort entries by time
    journalEntries[dateKey].logEntries.sort((a, b) => a.time.localeCompare(b.time));
    
    saveJournalEntries();
    renderCalendar();
    refreshEntriesList();
    
    // Clear form
    timeInput.value = '';
    noteInput.value = '';
    
    // Success feedback
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        const originalText = addBtn.textContent;
        addBtn.textContent = 'Added ✓';
        addBtn.style.background = '#28a745';
        
        setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.background = '';
        }, 1500);
    }
}

function refreshEntriesList() {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList || !selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (!dayData || !dayData.logEntries || dayData.logEntries.length === 0) {
        entriesList.innerHTML = '<div class="empty-state">Start logging your day by selecting an emoji, time, and adding a note above.</div>';
        return;
    }
    
    const sortedEntries = [...dayData.logEntries].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
    
    entriesList.innerHTML = sortedEntries.map(entry => `
        <div class="log-entry" data-entry-id="${entry.id}">
            <div class="entry-emoji" data-field="emoji">${entry.category}</div>
            <div class="entry-time" data-field="time">${entry.time}</div>
            <div class="entry-text" data-field="text">${entry.details}</div>
            <div class="entry-actions">
                <button class="entry-edit" onclick="editLogEntry(${entry.id})" title="Edit entry">✏️</button>
                <button class="entry-delete" onclick="deleteLogEntry(${entry.id})" title="Delete entry">×</button>
            </div>
        </div>
    `).join('');
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
    }
}

function editLogEntry(entryId) {
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (!dayData || !dayData.logEntries) return;
    
    const entry = dayData.logEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (!entryElement) return;
    
    // Check if already editing
    if (entryElement.classList.contains('editing')) {
        saveEditedEntry(entryId);
        return;
    }
    
    // Enter edit mode
    entryElement.classList.add('editing');
    
    // Replace emoji with selector
    const emojiElement = entryElement.querySelector('[data-field="emoji"]');
    const currentEmoji = entry.category;
    
    // Get all available emojis for the dropdown
    const allEmojis = [...customEmojis, ...defaultEmojis];
    const uniqueEmojis = [...new Set(allEmojis)];
    
    const emojiOptions = uniqueEmojis.map(emoji => 
        `<option value="${emoji}" ${currentEmoji === emoji ? 'selected' : ''}>${emoji}</option>`
    ).join('');
    
    emojiElement.innerHTML = `<select class="edit-emoji-select">${emojiOptions}</select>`;
    
    // Replace time with input
    const timeElement = entryElement.querySelector('[data-field="time"]');
    timeElement.innerHTML = `<input type="time" class="edit-time-input" value="${entry.time}">`;
    
    // Replace text with input
    const textElement = entryElement.querySelector('[data-field="text"]');
    textElement.innerHTML = `<input type="text" class="edit-text-input" value="${entry.details}">`;
    
    // Update action buttons
    const actionsElement = entryElement.querySelector('.entry-actions');
    actionsElement.innerHTML = `
        <button class="entry-save" onclick="saveEditedEntry(${entryId})" title="Save changes">💾</button>
        <button class="entry-cancel" onclick="cancelEditEntry(${entryId})" title="Cancel">❌</button>
    `;
    
    // Focus on text input
    const textInput = textElement.querySelector('.edit-text-input');
    textInput.focus();
    textInput.setSelectionRange(textInput.value.length, textInput.value.length);
}

function saveEditedEntry(entryId) {
    const dateKey = formatDateKey(selectedDate);
    const dayData = journalEntries[dateKey];
    
    if (!dayData || !dayData.logEntries) return;
    
    const entryElement = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (!entryElement) return;
    
    // Get edited values
    const newEmoji = entryElement.querySelector('.edit-emoji-select').value;
    const newTime = entryElement.querySelector('.edit-time-input').value;
    const newText = entryElement.querySelector('.edit-text-input').value.trim();
    
    if (!newTime || !newText) {
        alert('Please enter both time and note');
        return;
    }
    
    // Update the entry
    const entryIndex = dayData.logEntries.findIndex(e => e.id === entryId);
    if (entryIndex !== -1) {
        dayData.logEntries[entryIndex] = {
            ...dayData.logEntries[entryIndex],
            category: newEmoji,
            time: newTime,
            details: newText,
            lastModified: new Date().toISOString()
        };
        
        // Sort entries by time after editing
        dayData.logEntries.sort((a, b) => a.time.localeCompare(b.time));
        
        saveJournalEntries();
        renderCalendar();
        refreshEntriesList();
        
        // Show success feedback
        const saveBtn = entryElement.querySelector('.entry-save');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '✅';
            setTimeout(() => {
                if (document.querySelector(`[data-entry-id="${entryId}"]`)) {
                    refreshEntriesList(); // Refresh to exit edit mode
                }
            }, 1000);
        }
    }
}

function cancelEditEntry(entryId) {
    // Simply refresh the entries list to cancel editing
    refreshEntriesList();
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
                        categoryEmojis.add(entry.category);
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
            entries: journalEntries,
            customEmojis: customEmojis
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