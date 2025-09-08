# HBA Foundation Scholarship Platform

A robust Node.js application for managing and displaying scholarship opportunities for the HBA Foundation.

## Features

- **Scholarship Directory**: Browse and search available scholarships.
- **Advanced Filtering**: Filter scholarships by region, level, funding type, and more.
- **Contribution System**: Allow users to submit new scholarship opportunities.
- **Admin Dashboard**: Manage scholarships and user contributions.
- **Authentication**: Secure user authentication and role-based access control.
- **Responsive Design**: Mobile-friendly interface with a modern look and feel.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (optional) or JSON file-based storage
- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston, Morgan

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/hba-foundation.git
    cd hba-foundation
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your configuration. For local development, the default settings are usually sufficient.

4.  **Start the server:**

    ```bash
    npm start
    ```

5.  **Access the application:**

    -   **Main Site:** [http://localhost:3000](http://localhost:3000)
    -   **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

## Configuration

The application is configured through the `.env` file. Here are the key variables:

-   `NODE_ENV`: The application environment (`development` or `production`).
-   `PORT`: The port the server will run on (default: `3000`).
-   `USE_MONGODB`: Set to `true` to use MongoDB or `false` for JSON file storage.
-   `MONGODB_URI`: The connection string for your MongoDB instance.
-   `SESSION_SECRET`: A secret key for session management.
-   `JWT_SECRET`: A secret key for generating JWT tokens.

## Project Structure

```
HBA Foundation/
├── data/                  # Data storage for JSON files
├── logs/                  # Application logs
├── public/                # Static assets (CSS, JS, images)
│   ├── css/               # CSS files
│   ├── images/            # Image assets
│   └── js/                # Client-side JavaScript
│       └── components/    # JavaScript components
├── src/                   # Server source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── admin.html             # Admin dashboard HTML
├── index.html             # Main application HTML
├── package.json           # Project dependencies
├── README.md              # Project documentation
└── server.js              # Application entry point

## API Endpoints

### Scholarships

- `GET /api/scholarships`: Get all scholarships
- `GET /api/scholarships/:id`: Get scholarship by ID
- `GET /api/scholarships/search`: Search scholarships
- `GET /api/scholarships/filter`: Filter scholarships
- `POST /api/scholarships`: Create a new scholarship (auth required)
- `PUT /api/scholarships/:id`: Update a scholarship (auth required)
- `DELETE /api/scholarships/:id`: Delete a scholarship (auth required)

### Contributions

- `GET /api/contributions`: Get all contributions (auth required)
- `GET /api/contributions/:id`: Get contribution by ID (auth required)
- `GET /api/contributions/status/:status`: Get contributions by status (auth required)
- `POST /api/contributions`: Submit a new contribution
- `PUT /api/contributions/:id`: Update a contribution (auth required)
- `DELETE /api/contributions/:id`: Delete a contribution (auth required)
- `POST /api/contributions/:id/approve`: Approve a contribution (auth required)
- `POST /api/contributions/:id/reject`: Reject a contribution (auth required)

### Authentication

- `POST /api/auth/register`: Register a new user (admin auth required)
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user profile (auth required)
- `PUT /api/auth/profile`: Update user profile (auth required)

## Default Admin User

On first startup, the system creates a default admin user:
- Username: `admin`
- Password: `adminpassword`

**Important**: Change the default password immediately after first login.

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).