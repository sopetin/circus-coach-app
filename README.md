# Circus Coach Management App

A modern, responsive web application for managing circus classes, students, coaches, and attendance tracking.

## Features

- **Screen 0**: Screen selector with fullscreen icons for easy navigation
- **Screen 1**: Student management - Add kids/adults with classes, track membership and balance with color coding
- **Screen 2**: Coach management - Add coaches, assign lessons, view monthly/yearly dashboards
- **Screen 3**: Lesson configuration - Set up weekly schedules, day of week, times, coaches, and age groups
- **Screen 4**: Visit tracking - Easy attendance tracking with auto-selection of current day/class/coach
- **Screen 5**: Membership configuration - Configure payment-to-lessons ratio and free skip lessons

## Design

- Material UI with minimalistic design
- Circus-themed color coding (red, orange, yellow, green, blue)
- Fully responsive for both web and mobile devices
- Search functionality in menu
- Persistent data storage using localStorage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add Coaches**: Start by adding coaches in the Coaches screen
2. **Configure Lessons**: Set up your weekly lesson schedule in the Lessons screen
3. **Add Students**: Add students and assign them to classes in the Students screen
4. **Track Visits**: Use the Visits screen to mark attendance (automatically opens current day/lesson)
5. **Configure Membership**: Set up payment and lesson rules in the Membership screen

## Data Storage

All data is stored locally in your browser's localStorage. No server or database required.

## Built With

- React
- Material UI (MUI)
- React Router
- date-fns
