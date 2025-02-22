# Proctor AI

Proctor AI is an intelligent online proctoring system that leverages artificial intelligence to monitor and verify test-takers during exams. It provides an automated and efficient solution for online assessments, ensuring security and integrity through real-time face detection and tracking. The system alerts if multiple faces are detected, if the test-taker moves away, or if any suspicious activities occur.

## Features
- **AI-powered Face Detection**: Utilizes TensorFlow.js and MediaPipe to track and detect faces in real-time.
- **Real-time Monitoring**: Implements WebSockets and Socket.io for continuous, real-time tracking.
- **Secure and Scalable Architecture**: Uses React, TypeScript, and Express.js for a seamless web-based experience.
- **Automated Anomaly Detection**: Detects suspicious behaviors such as unauthorized people in the frame or test-takers leaving the screen.
- **Web-based Application**: Ensures easy access with no software installation required.

## Technologies Used
### Frontend
- **React**: A powerful JavaScript library for building dynamic and responsive user interfaces. React efficiently updates and renders components when data changes.
- **TypeScript**: Enhances JavaScript by adding static types, leading to better code maintainability, reliability, and developer efficiency.
- **Tailwind CSS**: Provides a utility-first CSS framework, allowing for rapid UI development with minimal custom styling.
- **TensorFlow.js**: A machine learning library that allows AI models to run directly in the browser, eliminating the need for server-side processing.
- **MediaPipe**: A Google library used for real-time face tracking, hand tracking, and pose estimation. This helps ensure accurate and efficient proctoring.
- **React Webcam**: A React component that accesses the user's webcam, capturing video frames for AI-based face detection and tracking.

### Backend
- **Node.js & Express.js**: A robust backend framework that handles API requests, session management, and business logic efficiently.
- **Socket.io**: Enables real-time, bidirectional communication between the client and server, ensuring immediate feedback and alerts during proctoring.
- **CORS (Cross-Origin Resource Sharing)**: Allows the frontend and backend to communicate securely, preventing unauthorized access and ensuring data integrity.

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/proctor-ai.git
   cd proctor-ai
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Start the backend server:
   ```sh
   node server/index.js
   ```

## Usage
1. Open the application in a web browser.
2. Grant access to your webcam for real-time face detection.
3. Begin a proctored session where the AI will monitor and flag any suspicious activities.
4. Receive automated alerts if anomalies like multiple faces or the test-taker leaving the screen are detected.
