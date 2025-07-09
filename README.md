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

## Documentation

This project includes comprehensive documentation organized into different categories. All documentation files are located in the `docs/` directory:

### 📚 API Documentation
Backend integration, modules analysis, and API requirements:
- [Admin Permissions](./docs/api/ADMIN_PERMISSIONS.md) - Admin permissions implementation
- [API Modules Analysis (Phase 1)](./docs/api/API_MODULES_ANALYSIS_PHASE1.md) - Initial modules analysis
- [Search Users Endpoint](./docs/api/API_SEARCH_USERS_ENDPOINT.md) - User search API implementation
- [API Update Summary](./docs/api/API_UPDATE_SUMMARY.md) - Summary of API updates
- [Backend Email URL Fix](./docs/api/BACKEND_EMAIL_URL_FIX.md) - Email URL configuration fixes
- [Modules API Requirements](./docs/api/MODULES_API_REQUIREMENTS.md) - API requirements for modules
- [Permissions API Backend Requirements](./docs/api/PERMISSIONS_API_BACKEND_REQUIREMENTS.md) - Backend requirements for permissions
- [Permissions API Refactor Complete](./docs/api/PERMISSIONS_API_REFACTOR_COMPLETE.md) - Permissions API refactoring results
- [Utils Analysis Final Summary](./docs/api/UTILS_ANALYSIS_FINAL_SUMMARY.md) - Final analysis of utility functions
- [Utils API Impact Analysis](./docs/api/UTILS_API_IMPACT_ANALYSIS.md) - Impact analysis of utility API changes

### 🎯 Features Documentation
Feature implementations and UI improvements:
- [Accordion Feature](./docs/features/ACCORDION_FEATURE.md) - Accordion component implementation
- [Collapsed Groups Feature](./docs/features/COLLAPSED_GROUPS_FEATURE.md) - Collapsible groups functionality
- [Delete Dialog Fix](./docs/features/DELETE_DIALOG_FIX.md) - Delete confirmation dialog improvements
- [Permissions Homologation Edit](./docs/features/PERMISOS_HOMOLOGADOS_EDITAR.md) - Permissions editing homologation
- [Validation Limits Implementation](./docs/features/VALIDATION_LIMITS_IMPLEMENTATION.md) - Input validation limits

### 🔒 Security Documentation
Authentication, password reset, and security implementations:
- [Backend Reset Password Request](./docs/security/BACKEND_RESET_PASSWORD_REQUEST.md) - Password reset backend implementation
- [Backend URL Fix Reset Password](./docs/security/BACKEND_URL_FIX_RESET_PASSWORD.md) - Password reset URL fixes
- [Debug Reset Password](./docs/security/DEBUG_RESET_PASSWORD.md) - Password reset debugging guide
- [Login Fix Complete](./docs/security/LOGIN_FIX_COMPLETE.md) - Login functionality fixes
- [Reset Password Final Summary](./docs/security/RESET_PASSWORD_FINAL_SUMMARY.md) - Complete password reset implementation summary
- [Reset Password Implementation Complete](./docs/security/RESET_PASSWORD_IMPLEMENTATION_COMPLETE.md) - Password reset feature completion
- [Reset Password Implementation](./docs/security/RESET_PASSWORD_IMPLEMENTATION.md) - Password reset implementation details
- [Reset Password UI Homologation Complete](./docs/security/RESET_PASSWORD_UI_HOMOLOGATION_COMPLETE.md) - UI homologation for password reset
- [Reset Password UI Improvements](./docs/security/RESET_PASSWORD_UI_IMPROVEMENTS.md) - Password reset UI enhancements

### 📊 Project Reports
Development progress, testing reports, and project summaries:
- [Compilation Fixed Summary](./docs/reports/COMPILATION_FIXED_SUMMARY.md) - Compilation issues resolution
- [Dashboard Modernization Complete](./docs/reports/DASHBOARD_MODERNIZATION_COMPLETE.md) - Dashboard modernization results
- [Final Status Report](./docs/reports/FINAL_STATUS_REPORT.md) - Project final status
- [Frontend Adaptation Complete](./docs/reports/FRONTEND_ADAPTATION_COMPLETE.md) - Frontend adaptation completion
- [Modernization Complete](./docs/reports/MODERNIZATION_COMPLETE.md) - Complete modernization summary
- [Modernization Summary](./docs/reports/MODERNIZATION_SUMMARY.md) - Modernization process summary
- [Project Successfully Completed](./docs/reports/PROYECTO_COMPLETADO_EXITOSAMENTE.md) - Project completion report
- [Testing Status Report](./docs/reports/TESTING_STATUS_REPORT.md) - Testing status and results

### ⚙️ Setup & Configuration
Project setup, definitions, and tutorials:
- [Backend Permissions Definition](./docs/setup/DEFINICION_PERMISOS_BACKEND.md) - Backend permissions system definition
- [Tutorial](./docs/setup/tutorial.md) - Project setup and usage tutorial

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any improvements or suggestions.

When contributing, please:
1. Follow the existing code style and conventions
2. Add appropriate tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

This project is licensed under the MIT License. See the LICENSE file for more details.