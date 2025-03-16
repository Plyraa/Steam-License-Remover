// ==UserScript==
// @name         Steam License Remover
// @namespace
// @version      1.0
// @description  Remove any "Free" games from your Steam Library by removing the game's license from your account.
// @author       Claude
// @match        https://store.steampowered.com/account/licenses/
// ==/UserScript==

const removeLinkEls = document.querySelectorAll('.free_license_remove_link > a');
let itemIds = [];
removeLinkEls.forEach(el => itemIds.push(el.getAttribute('href').match(/\d+/)[0]));
const total = itemIds.length;
console.log(`Starting removal of ${total} entries`);
const start = Date.now();
let removed = 0;
let isProcessing = false;
let cooldownActive = false;
let cooldownTimer = null;
let cooldownEndTime = 0;

// For tracking removal rate
const removalHistory = [];
const HOUR_IN_MS = 60 * 60 * 1000;

// Constants
const COOLDOWN_ERROR_CODE = 84;
const SUCCESS_CODES = [1, 8]; // Both 1 and 8 are success codes
const COOLDOWN_WAIT_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
const NORMAL_WAIT_TIME = 2000; // 2 seconds in milliseconds

// Function to calculate removal rate
function calculateRemovalRate() {
    const now = Date.now();
    // Keep only entries from the last hour
    const recentRemovals = removalHistory.filter(timestamp => now - timestamp < HOUR_IN_MS);
    
    // Update the history array
    removalHistory.length = 0;
    removalHistory.push(...recentRemovals);
    
    // Calculate removals per hour
    const hoursPassed = (now - start) / HOUR_IN_MS;
    const overallRate = removed / hoursPassed;
    const recentRate = recentRemovals.length;
    
    return {
        overall: Math.round(overallRate * 10) / 10, // Round to 1 decimal place
        recent: recentRate
    };
}

// Function to process the next item
async function processNextItem() {
    // Prevent multiple concurrent executions
    if (isProcessing) {
        console.warn("Already processing an item, skipping this call");
        return;
    }
    
    // Check if we're in cooldown
    if (cooldownActive) {
        console.warn("In cooldown period, skipping this call");
        return;
    }
    
    // Check if we're done
    if (!itemIds.length) {
        console.info(`All ${total} licenses removed!`);
        return;
    }

    isProcessing = true;
    const currentId = itemIds.pop();
    
    // Use FormData
    const formData = new FormData();
    formData.append('sessionid', g_sessionID);
    formData.append('packageid', currentId);
    
    try {
        const response = await fetch('https://store.steampowered.com/account/removelicense', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            console.error(`Failed to remove license ${currentId}:`, response);
            // Push the ID back to retry later
            itemIds.push(currentId);
            isProcessing = false;
            setTimeout(processNextItem, NORMAL_WAIT_TIME);
            return;
        }
        
        // Parse the response to check for success or cooldown
        const responseData = await response.json();
        console.log(`License ${currentId} removal response:`, responseData);
        
        if (responseData.success === COOLDOWN_ERROR_CODE) {
            console.warn(`Cooldown detected! Waiting for 10 minutes before continuing...`);
            // Push the ID back to retry later
            itemIds.push(currentId);
            
            // Set cooldown flag
            cooldownActive = true;
            cooldownEndTime = Date.now() + COOLDOWN_WAIT_TIME;
            
            // Clear any existing cooldown timer
            if (cooldownTimer) {
                clearInterval(cooldownTimer);
            }
            
            // Show a countdown timer for cooldown
            cooldownTimer = setInterval(() => {
                const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
                if (remaining <= 0) {
                    clearInterval(cooldownTimer);
                    cooldownTimer = null;
                    cooldownActive = false;
                    console.info("Cooldown period finished, resuming license removal...");
                    // Only call processNextItem here, after cooldown is complete
                    isProcessing = false;
                    processNextItem();
                } else {
                    console.info(`Cooldown: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} minutes remaining`);
                }
            }, 15000); // Update every 15 seconds
            
            // Don't set another timeout here, wait for the cooldown timer to complete
            isProcessing = false;
            
        } else if (SUCCESS_CODES.includes(responseData.success)) {
            removed++;
            // Record the timestamp of this successful removal
            removalHistory.push(Date.now());
            
            // Calculate removal rate
            const rate = calculateRemovalRate();
            
            // Update progress
            const now = Date.now();
            const elapsed = (now - start) / 1000; // elapsed time in seconds
            const remaining = itemIds.length > 0 ? Math.floor(elapsed / removed * itemIds.length) : 0;
            
            console.info(
                `Removed ${removed} of ${total} licenses (success code: ${responseData.success}). ` +
                `Rate: ${rate.recent}/hour (last hour), ${rate.overall}/hour (overall). ` +
                `ETA: ${new Date(now + remaining * 1000).toLocaleTimeString()}`
            );
            
            // Schedule next item
            isProcessing = false;
            setTimeout(processNextItem, NORMAL_WAIT_TIME);
        } else {
            console.error(`Unknown response code for license ${currentId}:`, responseData);
            // Push the ID back to retry later
            itemIds.push(currentId);
            isProcessing = false;
            setTimeout(processNextItem, NORMAL_WAIT_TIME);
        }
    } catch (error) {
        console.error(`Error removing license ${currentId}:`, error);
        // Push the ID back to retry later
        itemIds.push(currentId);
        isProcessing = false;
        // Continue with the next item even if there was an error
        setTimeout(processNextItem, NORMAL_WAIT_TIME);
    }
}

// Start processing items
if (itemIds.length > 0) {
    processNextItem();
}
