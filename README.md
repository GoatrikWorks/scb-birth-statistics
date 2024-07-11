# SCB Birth Data Visualization

This project visualizes birth data from Statistics Sweden (SCB) for the years 2016-2020. It includes both a frontend React application and a backend Node.js server.

## Setup

1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Set up a MongoDB database and update the `MONGODB_URI` in the `.env` file
4. Start the backend server:
   ```
   cd backend && npm start
   ```
5. Start the frontend development server:
   ```
   cd frontend && npm start
   ```

## Features

- Fetches and displays birth data from SCB
- Allows updating of data from SCB API
- Visualizes data in both table and chart formats
- Includes a map view of Swedish municipalities
- Supports dark mode toggle

## Tech Stack

- Frontend: React, Recharts, Leaflet, Framer Motion
- Backend: Node.js, Express, MongoDB
- Data Source: SCB API

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
