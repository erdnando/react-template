# React Template Project

This is a React project template designed to serve as a foundation for building scalable and maintainable applications. It follows best practices in development, including clean architecture, reusable components, and unit testing.

## Project Structure

The project is organized into the following main directories:

- **public/**: Contains static files such as the main HTML file and favicon.
- **src/**: The source code of the application, including components, hooks, pages, services, store, types, utils, and styles.
  - **components/**: Contains reusable UI components and common layout components.
  - **hooks/**: Custom hooks for managing state and side effects.
  - **pages/**: Components representing different pages of the application.
  - **services/**: Functions for handling API calls and authentication.
  - **store/**: Redux store configuration and slices for state management.
  - **types/**: TypeScript types for better type safety.
  - **utils/**: Utility functions and constants used throughout the application.
  - **data/**: Mock data for testing and development.
  - **styles/**: Global CSS styles and variables.

## Features

- **Reusable Components**: The project includes common components like Layout and Navigation, as well as UI components like Button and Card.
- **Routing**: The application is set up to handle routing between different pages.
- **State Management**: Utilizes Redux for managing application state.
- **Unit Testing**: Each component and page includes unit tests to ensure functionality and reliability.
- **Responsive Design**: The project is designed to be responsive, ensuring a good user experience on various devices.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd react-template
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. **Configure environment variables**:
   Copy `.env.example` to `.env` and configure your API URL:
   ```
   cp .env.example .env
   ```
   
   Edit `.env` and set your API URL:
   ```
   REACT_APP_API_URL=http://localhost:5096/api
   ```

5. Start the development server:
   ```
   npm start
   ```

6. Open your browser and go to `http://localhost:3000` to see the application in action.

## API Integration

This project is configured to work with a .NET Core Web API backend. The API configuration includes:

- **Base URL**: Configurable via `REACT_APP_API_URL` environment variable
- **Authentication**: JWT token-based authentication with automatic header injection
- **Services**: Dedicated service files for Users, Tasks, Catalogs, and Authentication
- **Fallback**: Demo user fallback when API is not available

### API Endpoints Expected

The frontend expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

#### Catalogs
- `GET /api/catalogs` - Get all catalogs
- `GET /api/catalogs/{id}` - Get catalog by ID
- `POST /api/catalogs` - Create new catalog
- `PUT /api/catalogs/{id}` - Update catalog
- `DELETE /api/catalogs/{id}` - Delete catalog

### Demo Credentials

When the API is not available, you can use these demo credentials:
- **Username**: `demo` or `demo@example.com`
- **Password**: `demo123`

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any improvements or suggestions.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.