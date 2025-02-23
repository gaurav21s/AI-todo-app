# AI-Powered Task Management Application

## Overview

This project is a full-stack web application designed to manage tasks efficiently, enhanced with artificial intelligence (AI) to provide intelligent task organization, actionable insights, and comprehensive reporting capabilities. Built using a modern technology stack, it leverages React, TypeScript, Vite, and Tailwind CSS on the frontend, and Node.js, Express, Drizzle ORM, and Groq AI on the backend. The application provides a user-friendly interface for creating, updating, deleting, and tracking tasks, while the AI integration assists users in optimizing their productivity and workflow.

## Technology Stack

*   **Frontend:**
    *   **React:** JavaScript library for building user interfaces.
    *   **TypeScript:** Superset of JavaScript that adds static typing for enhanced code quality and maintainability.
    *   **Vite:** Fast build tool and development server offering optimized development experience and rapid build times.
    *   **Wouter:** Minimalist routing library for declarative navigation in React applications.
    *   **Tailwind CSS:** Utility-first CSS framework enabling rapid UI development with a consistent design language.
    *   **Radix UI:** Unstyled, accessible UI primitives providing a foundation for creating customizable and accessible components.
    *   **React Query:** Library for managing server state with caching, background updates, and automatic retries, reducing boilerplate for data fetching and synchronization.
    *   **Zod:** TypeScript-first schema declaration and validation library for ensuring data integrity.
    *   **React Hook Form:** Flexible and performant library for building robust forms in React.
    *   **Lucide React:** High-quality open-source icon library for a consistent visual experience.
    *   **Class Variance Authority (CVA), clsx, tailwind-merge:** Utilities for dynamically composing CSS class names with enhanced performance.
    *   **Date-fns:** Comprehensive library for manipulating and formatting dates in a performant and localized manner.
    *   **Embla Carousel:** Performant and extensible carousel component for React.
    *   **Vaul:** Versatile drawer component for creating sliding panel interfaces.
    *   **Recharts:** Declarative charting library for building responsive and interactive data visualizations.

*   **Backend:**
    *   **Node.js:** JavaScript runtime environment for building scalable and efficient server-side applications.
    *   **Express:** Web application framework for Node.js, providing robust routing, middleware support, and request handling capabilities.
    *   **TypeScript:** Superset of JavaScript that adds static typing.
    *   **Drizzle ORM:** Modern TypeScript ORM for interacting with databases with type-safe queries and migrations.
    *   **Neon:** Serverless Postgres database offering scalability and cost-effectiveness.
    *   **Passport.js:** Authentication middleware for Node.js, supporting a wide range of authentication strategies.
    *   **Express Session:** Middleware for managing user sessions, enabling persistent authentication.
    *   **Connect PG Simple:** Session store for Postgres, providing a reliable and scalable session storage solution.
    *   **Groq:** AI inference platform for generating task insights, reports, and tags, enhancing the application with intelligent features.
    *   **@langchain/groq:** Langchain integration with Groq.
    *   **@neondatabase/serverless:** Neon Serverless driver.

*   **Shared:**
    *   **Drizzle ORM:** Defining the database schema and generating type-safe database interactions.
    *   **Zod:** Defining data validation schemas shared between the client and server, ensuring consistency and data integrity across the application.

## Architecture

The application follows a layered architecture to separate concerns and promote maintainability:

1.  **Presentation Layer (Frontend):** Handles user interaction, rendering UI components, and communicating with the backend API.

2.  **API Layer (Backend):** Exposes RESTful API endpoints for the frontend to interact with, handling requests, validating data, and orchestrating business logic.

3.  **Business Logic Layer (Backend):** Implements the core application logic, including task management, AI integration, and report generation.

4.  **Data Access Layer (Backend):** Provides an abstraction layer for database interactions, encapsulating data access logic and simplifying data retrieval and persistence.

5.  **Data Layer (Database):** Stores and manages application data using Neon, a serverless Postgres database.

## Functionality

*   **User Authentication:**
    *   Secure user registration and login using Passport.js with local strategy.
    *   Password hashing with `scrypt` and unique salts for enhanced security.
    *   Session management using `express-session` and `connect-pg-simple` for persistent authentication.
*   **Task Management:**
    *   Create, update, delete, and complete tasks with titles, descriptions, priorities, and due dates.
    *   Tasks are associated with specific users for personalized management.
*   **AI Insights:**
    *   Integration with the Groq AI service for intelligent task analysis and insights.
    *   Automated task grouping based on semantic similarity, categorization of similar tasks into groups
    *   Actionable recommendations to improve productivity and workflow efficiency.
    *   Automated task tagging using AI, making organization and search more efficient.
    *   Display of key performance metrics, such as completion rate.
*   **Report Generation:**
    *   Generation of comprehensive task reports with AI-powered analysis.
    *   Reports include executive summaries, task analysis, productivity metrics, work style analysis, and strategic recommendations.
    *   Downloadable reports in Markdown format.
*   **Responsive Design:**
    *   The application is fully responsive and adapts to different screen sizes using Tailwind CSS.
    *   Mobile-friendly components and layouts are implemented using React and responsive design principles.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd gaurav21s-ai-todo-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    *   Create a `.env` file in the root directory.
    *   Define the following environment variables:

        *   `DATABASE_URL`: URL of the Neon Postgres database.
        *   `SESSION_SECRET`: Secret key for session management.
        *   `GROQ_API_KEY`: API key for the Groq AI service.

    *   Ensure the database is provisioned.

4.  **Run database migrations:**
    ```bash
    npm run db:push
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```

6.  **Access the application:**
    *   Open a web browser and navigate to `http://localhost:5000`.

## Deployment

To deploy the application to production:

1.  **Build the frontend:**
    ```bash
    npm run build
    ```

2.  **Copy the built assets to the backend's public directory:**
    The `npm run build` script is configured to copy the frontend assets to the `dist/public` directory, so no further action is required.

3.  **Set the `NODE_ENV` environment variable to `production`:**

4.  **Start the backend server:**
    ```bash
    npm start
    ```

## API Endpoints

*   `POST /api/register`: Register a new user.
*   `POST /api/login`: Authenticate and log in an existing user.
*   `POST /api/logout`: Log out the currently authenticated user.
*   `GET /api/user`: Get the currently authenticated user's information.
*   `GET /api/tasks`: Get all tasks associated with the currently authenticated user.
*   `POST /api/tasks`: Create a new task for the currently authenticated user.
*   `PATCH /api/tasks/:id`: Update an existing task with the specified ID.
*   `DELETE /api/tasks/:id`: Delete a task with the specified ID.
*   `GET /api/insights`: Get AI-powered task insights for the currently authenticated user.
*   `POST /api/insights/refresh`: Manually trigger a refresh of the AI-powered insights for the currently authenticated user.
*   `GET /api/report`: Generate and retrieve a comprehensive task report for the currently authenticated user.

## Contributing

Contributions to this project are welcome. To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Implement your changes, adhering to the project's coding standards.
4.  Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License.
