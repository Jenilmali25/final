# **App Name**: Guardian Angel

## Core Features:

- Start/Stop Monitoring: Display a 'Start Monitoring' button that initiates background sensor data collection.
- Emergency Alert: Include an 'Emergency Alert' button for immediate help requests.
- Status Display: Real-time status display (e.g., Normal, Fall Detected) that reflects the app’s current state and detected events.
- Sensor Data Monitoring: Background service to continuously collect accelerometer, gyroscope data. It is implemented as a tool which analyzes sensor data and identifies potential fall events in real time.
- Runtime Permissions: Handle location and sensor access at runtime, ensuring users can grant necessary permissions on demand.
- Emergency Trigger and Call: Display an alert dialog and directly call 8778124700 without additional permissions when the 'Emergency Alert' button is triggered. Google assistant API used
- Audio commands with LLM filtering : Analyze user speech and make sure is clear and has audio command and direct calls available for an emergency. it is implemented as a tool for filtering unclear voices or words

## Style Guidelines:

- Primary color: Indigo (#4B0082), providing a sense of security, stability, and trust. 
- Background color: Light lavender (#E6E6FA), derived from the primary color hue with low saturation to maintain a calm and unobtrusive feel.
- Accent color: Deep violet (#800080), which complements the indigo primary by offering visual contrast and guiding user attention to crucial elements.
- Font: 'PT Sans' (sans-serif), used for both headlines and body text.  'PT Sans' provides a clean, modern look, suitable for accessibility and readability on various screen sizes.
- Use clear and universally recognizable icons for primary actions such as start/stop monitoring, and emergency alerts. Ensure sufficient contrast and size for visually impaired users.
- Maintain a simple, intuitive layout with high contrast and sufficient spacing for easy interaction. Follow Android accessibility guidelines to support screen readers and other assistive technologies.
- Use subtle, non-distracting animations for status changes or alerts. Ensure animations do not cause seizures or other adverse effects, adhering to accessibility standards.