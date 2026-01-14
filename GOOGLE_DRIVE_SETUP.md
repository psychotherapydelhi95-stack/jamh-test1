# Google Drive Setup Guide for JAMH

This guide will walk you through setting up the automated article management system using Google Drive.

## Part 1: Create Google Drive Folder Structure

### Step 1: Create Root Folder

1. Go to [Google Drive](https://drive.google.com)
2. Click **New** → **Folder**
3. Name it: `JAMH Articles`
4. Right-click the folder → **Share** → **Change to "Anyone with the link"** → Set to **Viewer**
5. Copy the **Folder ID** from the URL
   - URL looks like: `https://drive.google.com/drive/folders/ABC123XYZ`
   - Folder ID is: `ABC123XYZ`
   - **Save this ID - you'll need it soon!**

### Step 2: Create Issue Folders

Inside `JAMH Articles`, create folders for each issue using **this exact format**:

```
Volume 1, Issue 1 (July-September 2025)
Volume 1, Issue 2 (October-December 2025)
Volume 1, Issue 3 (January-March 2026)
```

**Important naming rules:**
- Must start with "Volume X, Issue Y"
- Period in parentheses is required
- Capitalization doesn't matter, but be consistent

### Step 3: Create Article Type Subfolders

Inside **each issue folder**, create these subfolders:

```
Review Articles
Original Articles
Case Studies
```

You can add more types if needed (Editorial, Letters, etc.)

### Step 4: Upload Your PDFs

**Recommended filename format:**
```
Article Title - Author Name - pp. 1-10.pdf
```

Examples:
- `Neurobiology of Addiction - Dr. Smith - pp. 1-15.pdf`
- `Clinical Challenges - Dr. Jones, Dr. Brown - pp. 20-30.pdf`
- `Simple Title.pdf` (also works!)

**Where to upload:**
- Navigate to: `JAMH Articles` → `Volume 1, Issue 1` → `Review Articles`
- Drag and drop your PDF files

### Final Structure Example:

```
JAMH Articles/
├── Volume 1, Issue 1 (July-September 2025)/
│   ├── Review Articles/
│   │   ├── Neurobiology of Addiction.pdf
│   │   └── From Experimentation to Dependency.pdf
│   ├── Original Articles/
│   │   ├── Addiction Policy.pdf
│   │   └── Parent Training.pdf
│   └── Case Studies/
│       └── Clinical Challenges.pdf
├── Volume 1, Issue 2 (October-December 2025)/
│   ├── Review Articles/
│   └── Original Articles/
```

---

## Part 2: Set Up Google Apps Script

### Step 1: Create New Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it: `JAMH Article API`

### Step 2: Add the Script Code

1. Delete any existing code in `Code.gs`
2. Open the file `GOOGLE_APPS_SCRIPT.gs` from your website folder
3. **Copy all the code** from that file
4. **Paste it** into the Apps Script editor

### Step 3: Configure the Folder ID

1. Find this line near the top:
   ```javascript
   const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
   ```
2. Replace `YOUR_FOLDER_ID_HERE` with your actual folder ID (from Part 1, Step 1)
3. Example:
   ```javascript
   const DRIVE_FOLDER_ID = 'ABC123XYZ';
   ```
4. Click **Save** (disk icon)

### Step 4: Test the Script

1. Select the function: `manualRefresh` from the dropdown
2. Click **Run**
3. **First time only:** You'll need to authorize:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to JAMH Article API (unsafe)"
   - Click "Allow"
4. Check the **Execution log** - you should see JSON output with your articles
5. If you see errors, check:
   - Folder ID is correct
   - Folder is shared publicly
   - Folder structure matches the guide

### Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon → Select **Web app**
3. Fill in the form:
   - **Description:** `JAMH Article API v1`
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access** (if prompted)
6. **IMPORTANT:** Copy the **Web app URL**
   - Looks like: `https://script.google.com/macros/s/ABC.../exec`
   - **Save this URL - you'll need it next!**

### Step 6: Test the API

1. Open the Web app URL in a new browser tab
2. You should see JSON data with all your articles
3. If you see an error, go back to Step 4 and check the logs

---

## Part 3: Update Your Website

**I'll handle this part for you!** Just provide me with:

1. ✅ Your Web App URL (from Part 2, Step 5)

---

## Adding New Articles (After Setup)

1. Navigate to the correct folder in Google Drive
   - Example: `JAMH Articles/Volume 1, Issue 3/Review Articles`
2. Drag and drop your PDF file
3. **That's it!** The website will automatically show it

**Optional:** If you want to force a refresh immediately:
- Go to your Apps Script project
- Run the `manualRefresh` function
- (Otherwise it updates automatically when users visit)

---

## Creating a New Issue

1. In Google Drive, go to `JAMH Articles`
2. Create a new folder: `Volume 1, Issue 4 (April-June 2026)`
3. Inside it, create: `Review Articles`, `Original Articles`, `Case Studies`
4. Upload PDFs
5. The new issue will automatically appear on your website!

---

## Troubleshooting

### Issue: "Access Denied" error in browser
**Fix:** Make sure the Drive folder is shared with "Anyone with the link" (set to Viewer)

### Issue: "Cannot find folder" in Apps Script logs
**Fix:** Double-check the DRIVE_FOLDER_ID is correct

### Issue: Articles not showing up
**Fix:** 
- Verify folder names match the format exactly
- Make sure PDFs are in the correct subfolders
- Run `manualRefresh` function in Apps Script to check logs

### Issue: Need to update the script
**Fix:**
1. Go to your Apps Script project
2. Click **Deploy** → **Manage deployments**
3. Click the edit icon (pencil)
4. Change "Version" to **New version**
5. Click **Deploy**

---

## Need Help?

If something isn't working:
1. Check the Apps Script execution log (View → Logs)
2. Verify your folder structure matches exactly
3. Make sure all PDFs are actually PDF files (not Word docs, etc.)
