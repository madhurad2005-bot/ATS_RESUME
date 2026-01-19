
# ATS Resume Analyzer 🚀

An AI-powered resume analyzer built with modern web technologies. Analyze your resume against job descriptions and get actionable insights on ATS compatibility, missing keywords, and skill matching.

## 🌟 Features

- **Drag & Drop Resume Upload**: Easily upload your resume via drag-and-drop or file selector
- **Multi-Format Support**: Supports `.txt` and `.pdf` file formats
- **AI-Powered Analysis**: Intelligent comparison of resume against job descriptions
- **ATS Scoring**: Get an ATS score (0-100) indicating resume optimization
- **Skill Identification**: Automatically identifies and extracts skills from your resume
- **Missing Keywords Detection**: Highlights important keywords from the job description not in your resume
- **Visual Analytics**: Beautiful doughnut chart visualization using Chart.js
- **Authentication System**: Sign up, login, and logout functionality with client-side validation
- **Voice Greeting**: AI-powered voice greeting using Web Speech API
- **Glassmorphism UI**: Modern, responsive design with glassmorphic effects
- **Mobile Responsive**: Fully optimized for all screen sizes

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES6+)
- **UI Components**: Tailwind CSS, custom glassmorphism styles
- **Data Visualization**: Chart.js
- **PDF Support**: PDF.js
- **Voice**: Web Speech API
- **Architecture**: Modular, client-side rendering

## 📦 Project Structure

```
ATS PROJECT/
├── index.html          # Main HTML structure with modals and sections
├── app.js             # Core JavaScript logic and functionality
├── style.css          # Custom glassmorphism and styling
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ATS-Resume-Analyzer.git
   cd ATS-Resume-Analyzer
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - No server or build process required!

3. **Start analyzing**
   - Upload your resume (`.txt` or `.pdf`)
   - Paste a job description
   - Click "Analyze Resume"
   - View your ATS score and insights

## 📋 Usage Guide

### Authentication
- Click **"Sign Up"** to create a new account
- Click **"Sign In"** to log in
- Click **"Logout"** to sign out

### Resume Analysis
1. **Upload Resume**: Drag and drop or click to browse
2. **Add Job Description**: Paste the job description in the textarea
3. **Analyze**: Click the "Analyze Resume" button
4. **Review Results**:
   - ATS Score (0-100)
   - Identified Skills
   - Missing Keywords

### Voice Greeting
- The first time you interact with the page (click or mouse move), a voice greeting plays: "Hello! Welcome to the ATS website"
- Greeting plays only once per session

## 🔑 Key Functions

### File Upload
- `initializeFileUpload()` - Sets up drag-and-drop functionality
- `handleFileSelect()` - Processes selected files
- `readTextFile()` - Reads .txt files using FileReader API
- `readPdfFile()` - Reads .pdf files using PDF.js

### AI Analysis
- `analyzeResume()` - Orchestrates the analysis process
- `getAIAnalysis()` - Calls AI engine (OpenAI template included)
- `performLocalAnalysis()` - Local keyword matching algorithm

### Authentication
- `handleLoginSubmit()` - Processes login form
- `handleSignupSubmit()` - Processes signup form
- `handleLogout()` - Logs out the user
- `updateAuthUI()` - Updates navbar based on auth state

### UI & Voice
- `displayResults()` - Shows analysis results
- `displayAtsChart()` - Renders doughnut chart
- `initializeVoiceGreeting()` - Sets up voice greeting
- `showNotification()` - Displays toast notifications

## 🔧 Configuration

### OpenAI API Integration
To use real AI analysis instead of local simulation:

1. Uncomment the OpenAI method in `getAIAnalysis()` function (line ~350)
2. Add your OpenAI API key
3. The function will send prompts to OpenAI's GPT-3.5-turbo

### Puter.js Integration (Alternative)
- Replace the fetch call with Puter.js AI SDK
- Refer to Puter.js documentation for setup

## 📊 Console Logging

Open browser DevTools (F12) to see:
- Login/Signup attempts with credentials
- File upload events
- Analysis results
- Voice greeting events
- Authentication state changes

Example:
```javascript
🔐 Login Attempt: {
  email: "user@example.com",
  password: "password123",
  timestamp: "2026-01-17T12:00:00.000Z"
}
```

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (except some CSS features)
- IE11: ❌ Not supported

## 📝 Form Validation

**Login/Signup Validation:**
- Email format verification
- Password minimum 6 characters
- Password confirmation matching
- Terms of Service checkbox (signup)

## 🎨 UI Features

- **Responsive Design**: Mobile-first approach
- **Glassmorphism Effects**: Blur and transparency effects
- **Gradient Backgrounds**: Beautiful color gradients
- **Smooth Animations**: Blob animations, slide transitions
- **Toast Notifications**: Success/error feedback
- **Modal Dialogs**: Login and signup modals

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Support

For issues, questions, or suggestions, please open a GitHub issue.

## 🎯 Future Enhancements

- [ ] Backend API integration for secure authentication
- [ ] Database storage for user profiles and analysis history
- [ ] Advanced NLP for skill extraction
- [ ] Resume template suggestions
- [ ] Job description analysis
- [ ] Integration with real job boards
- [ ] Export analysis as PDF
- [ ] Dark/Light mode toggle
- [ ] Multi-language support
- [ ] Real OpenAI API integration

## 👨‍💻 Author

Created with ❤️ as a modern AI-powered resume analysis tool.

---

**Built with**: HTML5 • Tailwind CSS • Vanilla JavaScript • Chart.js • Web Speech API

**Last Updated**: January 17, 2026
