/**
 * JAMH Articles Loader
 * Fetches article data from Google Apps Script API and provides helper functions
 */

// Google Apps Script Web App URL
const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwcq6COyb4e-Cr5XoUChvGNLwN6_vQAEEsJyuLg0q6coddgNynwkudjo24tMs5z7Whj/exec';

// Cache to store fetched data (reduces API calls)
let articlesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch articles data from API with caching
 * @returns {Promise<Object>} Articles data
 */
async function fetchArticles() {
    // Return cached data if still valid
    if (articlesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
        return articlesCache;
    }

    try {
        const response = await fetch(API_ENDPOINT);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch articles');
        }

        // Update cache
        articlesCache = data;
        cacheTimestamp = Date.now();

        return data;

    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
}

/**
 * Get all issues
 * @returns {Promise<Array>} Array of issues
 */
async function getIssues() {
    const data = await fetchArticles();
    return data.issues || [];
}

/**
 * Get a specific issue by title
 * @param {string} issueTitle - The issue title to search for
 * @returns {Promise<Object|null>} Issue object or null if not found
 */
async function getIssue(issueTitle) {
    const issues = await getIssues();
    return issues.find(issue => issue.title === issueTitle) || null;
}

/**
 * Clear the cache (useful for forcing refresh)
 */
function clearCache() {
    articlesCache = null;
    cacheTimestamp = null;
}

/**
 * Format issue title for display
 * @param {Object} issue - Issue object
 * @returns {string} Formatted title
 */
function formatIssueTitle(issue) {
    return issue.title;
}

/**
 * Format issue period for display
 * @param {Object} issue - Issue object
 * @returns {string} Formatted period (e.g., "July–September 2025")
 */
function formatIssuePeriod(issue) {
    return issue.period;
}

/**
 * Parse the end date from issue period string
 * @param {string} period - Period string like "July-September 2025"
 * @returns {Date|null} End date or null if can't parse
 */
function parseIssuePeriod(period) {
    try {
        // Extract year from period (e.g., "July-September 2025" -> "2025")
        const yearMatch = period.match(/\d{4}/);
        if (!yearMatch) return null;
        const year = parseInt(yearMatch[0]);

        // Extract end month (e.g., "July-September 2025" -> "September")
        const months = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3,
            'may': 4, 'june': 5, 'july': 6, 'august': 7,
            'september': 8, 'october': 9, 'november': 10, 'december': 11
        };

        // Split on dash or other separators to get the end month
        const parts = period.toLowerCase().split(/[-–—]/);
        const endMonthStr = parts.length > 1 ? parts[1].trim() : parts[0].trim();

        // Find the month
        for (const [monthName, monthNum] of Object.entries(months)) {
            if (endMonthStr.includes(monthName)) {
                // Create date at end of month
                return new Date(year, monthNum + 1, 0); // Day 0 of next month = last day of this month
            }
        }

        return null;
    } catch (error) {
        console.error('Error parsing period:', period, error);
        return null;
    }
}

/**
 * Get status badge text for an issue
 * @param {Object} issue - Issue object
 * @returns {string} "Published" or "Upcoming"
 */
function getIssueStatus(issue) {
    // If has articles, always published
    if (issue.articleCount > 0) {
        return 'Published';
    }

    // No articles - check if date is in the future
    const endDate = parseIssuePeriod(issue.period);
    if (endDate) {
        const now = new Date();
        return endDate > now ? 'Upcoming' : 'Published';
    }

    // Can't parse date - default to upcoming if empty
    return 'Upcoming';
}

/**
 * Get badge class for an issue
 * @param {Object} issue - Issue object
 * @returns {string} CSS class name
 */
function getIssueBadgeClass(issue) {
    const status = getIssueStatus(issue);
    return status === 'Published' ? 'badge-success' : 'badge-under';
}
