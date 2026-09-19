#Link
https://gobinda22.github.io/attendance/

# Attendance Register Web App

A lightweight, modern Attendance Register designed for university faculty. It works entirely in your browser and uses **Google Sheets** as a free, reliable database. 

## 🌟 Key Features

*   **Google Sheets Backend:** No complicated database required. The app connects directly to a Google Sheet you own, keeping your data private, safe, and easily accessible.
*   **Semester Management:** Organize your classes by semester. Easily create new semesters, view students by semester, delete old semesters, or promote an entire batch of students to the next semester in one click.
*   **Bulk Student Import:** Forget typing names one by one. You can copy-paste a list of Roll Numbers and Names directly from Excel or Word to add your entire class in seconds.
*   **Smart Attendance Marking:** Pick a subject, date, and class type (Theory or Lab). Mark everyone present by default, and just tap the absent students. 
*   **Live Dashboard & Statistics:** Track attendance percentages instantly. Filter by date range (e.g., last 3 months, custom dates) or class type to see exactly who is falling behind.
*   **University Report Generation:** Automatically generate professional attendance reports formatted for university standards. You can print them directly or download them as Microsoft Word (`.doc`) files for signing.
*   **Data Export & Backup:** Take snapshots of your data (`.json`), export raw records (`.csv`), or automatically create a backup copy of your Google Sheet in your Drive.
*   **Mobile Friendly:** Clean and responsive UI that works just as well on your phone as it does on your laptop.

## 🚀 Setup Instructions

Setting this up requires two parts: the Google Sheet backend, and the HTML frontend.

### 1. Set up the Google Sheet (Backend)
1. Go to Google Sheets and create a new, blank spreadsheet.
2. In the top menu, click **Extensions → Apps Script**.
3. Delete any placeholder code in the editor, and paste the entire contents of `Code.gs` into the editor.
4. Click the **Save** icon (floppy disk).
5. In the top right corner, click **Deploy → New deployment**.
6. Click the gear icon next to "Select type" and choose **Web app**.
7. Set the following options:
   *   **Execute as:** `Me`
   *   **Who has access:** `Anyone`
8. Click **Deploy**. (You will need to authorize the script to access your Google Sheet — click Review Permissions, choose your account, click Advanced, and allow it).
9. Copy the **Web app URL** provided (it will end in `/exec`).

### 2. Set up the Web App (Frontend)
1. Open the `index.html` file in any modern web browser (or host it online using GitHub Pages, Netlify, etc.).
2. You will be greeted with a connection screen. 
3. Paste the **Web app URL** you copied in Step 9 into the input box and click **Connect**.
4. The app will connect to your Google Sheet, automatically create the necessary tabs (`Students`, `Subjects`, `Attendance`, `Settings`), and load your dashboard!

## 🔄 How to Update the Backend Code Later
If you ever update the `Code.gs` file in Apps Script, you **must** deploy it as a new version for changes to take effect:
1. Go to **Extensions → Apps Script** and paste the new code.
2. Click **Save**.
3. Click **Deploy → Manage deployments**.
4. Click the **Edit icon (pencil)** in the top right of the popup.
5. Change the **Version** dropdown to **New version**.
6. Click **Deploy**.

## 🛠️ Built With
*   **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
*   **Backend:** Google Apps Script
