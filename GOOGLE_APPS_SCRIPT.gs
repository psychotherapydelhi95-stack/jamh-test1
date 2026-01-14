/**
 * JAMH Article Management System - Google Apps Script
 * 
 * This script scans a Google Drive folder structure and generates a JSON API
 * containing all journal articles organized by volume, issue, and article type.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create this script at: script.google.com
 * 2. Replace DRIVE_FOLDER_ID below with your actual folder ID
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 4. Copy the deployment URL to your website's articles-loader.js
 */

// ========================================
// CONFIGURATION
// ========================================

// TODO: Replace with your Google Drive folder ID
// To get folder ID: Open folder in Drive, copy ID from URL
// Example URL: https://drive.google.com/drive/folders/ABC123XYZ
// Folder ID is: ABC123XYZ
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';

// ========================================
// MAIN API ENDPOINT
// ========================================

/**
 * Handle GET requests - returns JSON with all articles
 */
function doGet(e) {
  try {
    const data = generateArticlesJSON();
    
    return ContentService
      .createTextOutput(JSON.stringify(data, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to fetch articles. Check Apps Script logs.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Manual refresh trigger - run this from Apps Script editor to test
 */
function manualRefresh() {
  const data = generateArticlesJSON();
  Logger.log(JSON.stringify(data, null, 2));
  return data;
}

// ========================================
// CORE LOGIC
// ========================================

/**
 * Generate complete JSON structure of all articles
 */
function generateArticlesJSON() {
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const issues = [];
  
  // Get all issue folders (e.g., "Volume 1, Issue 1 (July-September 2025)")
  const issueFolders = rootFolder.getFolders();
  
  while (issueFolders.hasNext()) {
    const issueFolder = issueFolders.next();
    const issueName = issueFolder.getName();
    
    // Parse issue details from folder name
    const issueData = parseIssueName(issueName);
    
    if (!issueData) {
      Logger.log('Skipping folder (invalid name format): ' + issueName);
      continue;
    }
    
    // Process sections within this issue (Review Articles, Original Articles, etc.)
    const sections = processIssueSections(issueFolder);
    
    issues.push({
      title: issueName,
      volume: issueData.volume,
      issue: issueData.issue,
      period: issueData.period,
      folderId: issueFolder.getId(),
      sections: sections,
      articleCount: countArticles(sections)
    });
  }
  
  // Sort issues by volume and issue number
  issues.sort((a, b) => {
    if (a.volume !== b.volume) return a.volume - b.volume;
    return a.issue - b.issue;
  });
  
  return {
    success: true,
    issues: issues,
    totalIssues: issues.length,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Parse issue folder name to extract volume, issue, and period
 * Expected format: "Volume 1, Issue 2 (October-December 2025)"
 */
function parseIssueName(name) {
  // Pattern: Volume X, Issue Y (Period)
  const regex = /Volume\s+(\d+),?\s*Issue\s+(\d+)\s*\(([^)]+)\)/i;
  const match = name.match(regex);
  
  if (!match) return null;
  
  return {
    volume: parseInt(match[1]),
    issue: parseInt(match[2]),
    period: match[3].trim()
  };
}

/**
 * Process all sections (article types) within an issue folder
 */
function processIssueSections(issueFolder) {
  const sections = [];
  const sectionFolders = issueFolder.getFolders();
  
  // Define section order for consistent display
  const sectionOrder = {
    'Review Articles': 1,
    'Original Articles': 2,
    'Case Studies': 3,
    'Editorial': 4,
    'Letters': 5
  };
  
  while (sectionFolders.hasNext()) {
    const sectionFolder = sectionFolders.next();
    const sectionName = sectionFolder.getName();
    
    // Get all PDF files in this section
    const articles = processArticles(sectionFolder);
    
    if (articles.length > 0) {
      sections.push({
        type: sectionName,
        order: sectionOrder[sectionName] || 99,
        articles: articles
      });
    }
  }
  
  // Sort sections by predefined order
  sections.sort((a, b) => a.order - b.order);
  
  return sections;
}

/**
 * Process all PDF articles within a section folder
 */
function processArticles(sectionFolder) {
  const articles = [];
  const files = sectionFolder.getFiles();
  
  while (files.hasNext()) {
    const file = files.next();
    
    // Only process PDF files
    if (file.getMimeType() !== 'application/pdf') {
      Logger.log('Skipping non-PDF file: ' + file.getName());
      continue;
    }
    
    const fileName = file.getName();
    const fileId = file.getId();
    
    // Extract title from filename (remove .pdf extension)
    const title = fileName.replace(/\.pdf$/i, '');
    
    // Parse metadata from filename if available
    const metadata = parseArticleMetadata(title);
    
    articles.push({
      title: metadata.title || title,
      authors: metadata.authors || '',
      pages: metadata.pages || '',
      fileId: fileId,
      fileName: fileName,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      downloadUrl: `https://drive.google.com/uc?id=${fileId}&export=download`,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      size: formatFileSize(file.getSize()),
      lastModified: file.getLastUpdated().toISOString()
    });
  }
  
  return articles;
}

/**
 * Parse article metadata from filename
 * Example formats:
 * - "Article Title - Author Name - pp. 1-10.pdf"
 * - "Article Title - Author Name.pdf"
 * - "Article Title.pdf"
 */
function parseArticleMetadata(filename) {
  const metadata = {
    title: filename,
    authors: '',
    pages: ''
  };
  
  // Try to parse: "Title - Authors - pp. X-Y" format
  const parts = filename.split(' - ');
  
  if (parts.length >= 2) {
    metadata.title = parts[0].trim();
    
    // Check if last part contains page numbers
    const lastPart = parts[parts.length - 1];
    const pageMatch = lastPart.match(/pp?\.\s*(\d+[-–]\d+)/i);
    
    if (pageMatch) {
      metadata.pages = pageMatch[1];
      // Authors are everything between title and pages
      metadata.authors = parts.slice(1, -1).join(', ').trim();
    } else {
      // No page numbers, everything after title is authors
      metadata.authors = parts.slice(1).join(', ').trim();
    }
  }
  
  return metadata;
}

/**
 * Count total articles across all sections
 */
function countArticles(sections) {
  return sections.reduce((total, section) => total + section.articles.length, 0);
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// HELPER FUNCTIONS FOR TESTING
// ========================================

/**
 * Test function - lists all folders in the root
 */
function listRootFolders() {
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const folders = rootFolder.getFolders();
  
  Logger.log('=== Root Folders ===');
  while (folders.hasNext()) {
    const folder = folders.next();
    Logger.log(folder.getName() + ' (ID: ' + folder.getId() + ')');
  }
}

/**
 * Test function - shows folder structure
 */
function showFolderStructure() {
  const rootFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  Logger.log('=== Folder Structure ===');
  Logger.log('Root: ' + rootFolder.getName());
  
  const issueFolders = rootFolder.getFolders();
  while (issueFolders.hasNext()) {
    const issueFolder = issueFolders.next();
    Logger.log('  Issue: ' + issueFolder.getName());
    
    const sectionFolders = issueFolder.getFolders();
    while (sectionFolders.hasNext()) {
      const sectionFolder = sectionFolders.next();
      Logger.log('    Section: ' + sectionFolder.getName());
      
      const files = sectionFolder.getFiles();
      let fileCount = 0;
      while (files.hasNext()) {
        files.next();
        fileCount++;
      }
      Logger.log('      Files: ' + fileCount);
    }
  }
}
