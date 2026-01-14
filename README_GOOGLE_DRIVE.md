# Quick Start Guide - Google Drive Automation

## ✅ What's Been Done

All the code is ready! Here's what's been created:

1. **Google Apps Script** (`GOOGLE_APPS_SCRIPT.gs`) - Reads your Drive folders and generates API
2. **Dynamic Issue Page** (`issue.html`) - Single page that displays all issues
3. **Articles Loader** (`assets/articles-loader.js`) - JavaScript that fetches from API
4. **Updated Homepage** (`index.html`) - Now loads issues dynamically

## 🎯 What You Need to Do Now

### Part 1: Set Up Google Drive (15 minutes)

Follow the detailed guide: **`GOOGLE_DRIVE_SETUP.md`**

**Quick summary:**
1. Create `JAMH Articles` folder in Google Drive
2. Make it public (Anyone with link → Viewer)
3. Copy the folder ID from URL
4. Create subfolders following the format:
   - `Volume 1, Issue 1 (July-September 2025)/`
     - `Review Articles/`
     - `Original Articles/`
     - `Case Studies/`

### Part 2: Set Up Apps Script (10 minutes)

1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Copy code from `GOOGLE_APPS_SCRIPT.gs`
4. Replace `YOUR_FOLDER_ID_HERE` with your actual folder ID
5. Deploy as Web App
6. Copy the deployment URL

### Part 3: Connect to Website (2 minutes)

1. Open `assets/articles-loader.js`
2. Find line 6: `const API_ENDPOINT = 'YOUR_APPS_SCRIPT_URL_HERE';`
3. Replace with your actual Web App URL
4. Save the file

### Part 4: Upload PDFs

Just drag and drop PDFs into the correct Drive folders!

**Recommended filename format:**
```
Article Title - Author Name - pp. 1-10.pdf
```

The script will automatically extract:
- Title
- Authors  
- Page numbers

## 🚀 That's It!

Your website will now:
- ✅ Automatically show all issues from Google Drive
- ✅ Dynamically load articles when you add PDFs
- ✅ Serve PDFs directly from Google Drive
- ✅ Update without editing HTML

## 📝 Adding New Articles in the Future

1. Navigate to the right folder in Google Drive
2. Upload PDF
3. Done! It will appear on your website automatically

## 🆘 Need Help?

- Detailed guide: See `GOOGLE_DRIVE_SETUP.md`
- Folder structure: Must match "Volume X, Issue Y (Period)" format
- PDFs not showing: Check folder permissions are public
- API errors: Verify Apps Script is deployed correctly

## 📂 Files Created

- `GOOGLE_APPS_SCRIPT.gs` - Copy this to Apps Script
- `GOOGLE_DRIVE_SETUP.md` - Detailed setup instructions
- `assets/articles-loader.js` - Fetches data from API
- `issue.html` - Dynamic article display page
- `index.html` - Updated to load issues dynamically
