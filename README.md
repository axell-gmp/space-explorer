🌍 Space Explorer

Space Explorer is an interactive 3D web application that allows users to explore the Earth in real time, select countries directly from a rotating globe, and retrieve detailed information about them using external APIs.

🚀 Features
🌐 Interactive 3D Earth built with Three.js
🖱️ Click on any location to detect and highlight countries
🔍 Smart country search with autocomplete suggestions
📊 Real-time country data (population, capital, currency, region)
🏳️ Dynamic flag display
✨ Smooth animations and modern UI design
🌌 Starfield background and atmospheric effects
🛠️ Technologies Used
HTML5 – Structure of the application
CSS3 – Styling, animations, and responsive design
JavaScript (ES6+) – Application logic and interactivity
Three.js – 3D rendering and WebGL graphics
REST APIs:
🌍 GeoJSON dataset for country shapes
🌐 REST Countries API for real-time country data
🔗 APIs Integration

The application connects to external APIs to fetch live data:

1. GeoJSON (Country Boundaries)

Used to determine the geographical shape and position of countries: fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
2. REST Countries API
Used to retrieve country details: fetch(`https://restcountries.com/v3.1/name/${countryName}`)

Data Retrieved:
Country name
Capital city
Population
Currency
Region
Flag

⚙️ How It Works
The 3D globe is rendered using Three.js
User interactions (click/search) are captured
Coordinates are converted into latitude and longitude
The app checks which country was selected using GeoJSON data
A request is sent to the REST API
The data is displayed dynamically in the UI

📂 Project Structure

Space-Explorer/
│── index.html     # Main HTML structure
│── style.css      # Styling and animations
│── app.js         # Core logic and 3D functionality
│── logo.png       # Logo asset

💡 Key Concepts Implemented
3D graphics rendering (WebGL)
Raycasting for object interaction
Point-in-polygon algorithm (country detection)
Asynchronous JavaScript (fetch, async/await)
DOM manipulation
UI/UX design principles

🔮 Future Improvements
🌎 Add more detailed country data (GDP, languages, etc.)
📍 Zoom into cities or regions
💾 Save favorite countries
🌙 Dark/Light mode toggle
📱 Mobile optimization improvements

📚 Learning Outcomes

Through this project, I gained experience in:

Front-end web development
Working with APIs
3D graphics programming
Data visualization
Building interactive user interfaces

⚠️ Disclaimer & Credits

This project is developed for educational purposes only. All external data, assets, and libraries used in this application belong to their respective owners.

📡 External Data Sources
Country boundary data is provided via GeoJSON from Natural Earth datasets (public domain).
Country information (such as population, capital, currency, etc.) is retrieved from the REST Countries API.

I do not claim ownership of the data provided by these services. The accuracy, availability, and completeness of the data depend entirely on the respective providers.

🧩 Libraries & Resources

This project uses the following external libraries and resources:

Three.js – for 3D rendering and WebGL graphics
OrbitControls (Three.js addon) – for camera interaction
Google Fonts – for typography (Orbitron, Space Mono)

All rights for these libraries belong to their original creators and contributors.

🌍 Usage Notice
This project is not affiliated with any official geographic or governmental organization.
The data displayed is for informational and demonstration purposes only.
No guarantee is made regarding the accuracy or reliability of the information.
🙏 Credits

Special thanks to:

The open-source community for providing free tools and resources
Developers and contributors behind the APIs and libraries used in this project
