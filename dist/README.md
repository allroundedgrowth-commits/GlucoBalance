# GlucoBalance

A mobile-first Progressive Web Application (PWA) for comprehensive diabetes prevention, early detection, and ongoing management.

## Features

### 🎯 Risk Assessment
- WHO/ADA-compliant questionnaire
- Personalized diabetes risk scoring
- AI-powered explanations and recommendations

### 🍎 Nutrition & Lifestyle Planning
- 3-day diabetic and heart-friendly meal plans
- Adaptable to local cuisines and dietary restrictions
- AI-generated lifestyle tips

### 💙 Mental Health Support
- Daily mood check-ins (1-5 scale with emojis)
- Gemini AI-generated affirmations and coping strategies
- Mood trend visualization

### 📊 Progress Dashboard
- Interactive charts for risk score changes
- Mood trends over time
- Nutrition adherence tracking
- AI-powered health insights

### 📄 Doctor Report Generator
- Comprehensive 30-day health summaries
- Clinician-ready PDF reports
- Easy sharing with healthcare providers

### 👤 User Profile & Settings
- Personal information management
- Notification preferences
- Gemini AI integration settings

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Database**: IndexedDB with localStorage fallback (Kiro Database)
- **AI Integration**: Google Gemini AI API
- **PWA**: Service Worker, Web App Manifest
- **Design**: Mobile-first, Azure Blue & White color palette

## Getting Started

### Prerequisites
- Modern web browser with PWA support
- (Optional) Google Gemini AI API key for enhanced features

### Installation

1. Clone or download the repository
2. Open `index.html` in a web browser
3. For enhanced AI features, obtain a Gemini AI API key and enter it in Profile > Settings

### Local Development

Simply open `index.html` in your browser. The app works entirely client-side with local data storage.

For a local server (recommended for PWA features):
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Usage

### First Time Setup
1. Start with the risk assessment questionnaire
2. Complete your profile information
3. Begin daily mood tracking
4. Generate your first meal plan

### Daily Use
1. Check in with your mood (takes 30 seconds)
2. Review AI-generated health insights
3. Follow your personalized meal plan
4. Track progress over time

### Healthcare Integration
1. Generate monthly reports for doctor visits
2. Export your data for healthcare providers
3. Use insights to guide health conversations

## Data Privacy

- All data is stored locally on your device
- No personal information is sent to external servers (except AI API calls)
- You control your data with export and delete options
- AI interactions are processed securely through Google's Gemini API

## AI Features

When you provide a Gemini AI API key, you unlock:
- Personalized risk explanations
- Custom meal plan generation
- Mood-based affirmations
- Progress analysis insights
- Motivational messages

Without an API key, the app provides helpful fallback responses.

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with PWA support

## Contributing

This is a demonstration project showcasing modern web development practices for healthcare applications.

## License

This project is for educational and demonstration purposes.

## Disclaimer

GlucoBalance is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding your health concerns.

## Support

For technical issues or questions about the implementation, please refer to the code documentation and comments within the source files."# GlucoBalance" 
