# Messenger Real-Time Comm Link 🚀

A hyper-fast, secure, real-time chat application built using modern WebSockets and containerized microservices. Designed with an aesthetic-first approach and rapid iteration cycles to deliver instant, low-latency communication.

## ✨ Key Features
- **Encrypted Party Rooms:** Instantly generate a secure 6-character room code or join an active operative's room.
- **Low-Latency WebSockets:** Bidirectional, instant messaging powered by Socket.IO.
- **Smart State Validation:** The Node.js backend actively validates room availability before allowing new connections, preventing ghost rooms and data leaks.
- **Message Persistence:** Chat histories are securely stored in MongoDB and loaded instantly upon room entry to preserve context.
- **Messenger Tech Aesthetic:** A custom, highly-polished sci-fi UI featuring glassmorphism, dynamic fluid mesh gradients, and a responsive layout.

## 🛠 Tech Stack
- **Frontend:** React, Vite, TailwindCSS v4
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB Atlas, Mongoose ODM
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI Pipeline)

## 🧠 AI-Assisted Engineering (Vibe Coding)
This repository leverages an AI-assisted, highly iterative development methodology. Instead of traditional, heavy upfront wireframing, the application was built through rapid, descriptive iterations:

- **Architecture First:** Initialized core socket connections, React state synchronization, and the MongoDB schema.
- **Rapid UI Iteration:** Transitioned through multiple UI revamps using AI as a design partner, rapidly landing on the sleek "Messenger" gamer aesthetic.
- **Incremental Refinement:** Scaled the application by adding active room validation, Docker containerization, and automated CI pipelines as the system's complexity grew.

## 🏗 System Architecture

```mermaid
graph TD;
    subgraph Frontend [Client Subsystem]
        UI[React + Vite + Tailwind]
        User((End User)) -->|Inputs Room Code| UI
    end

    subgraph Backend [Server Subsystem]
        API[Express API]
        Socket[Socket.IO Engine]
        API <--> Socket
    end

    subgraph Database [Persistence Layer]
        Mongoose[Mongoose ODM]
        MongoCluster[(MongoDB Atlas)]
        Mongoose <--> MongoCluster
    end

    %% Connections
    UI -->|HTTP Handshake & Upgrade| Socket
    Socket -->|Bi-directional Event Stream| UI
    API -->|Read/Write Chat History| Mongoose
    
    %% Event Flow
    classDef event fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    Socket -- "on('join_party')" --> Validate{Is Room Active?}
    Validate -- "Yes" --> JoinRoom[Join Socket Room]:::event
    Validate -- "No" --> EmitError[Emit 'party_error']:::event
    Socket -- "on('send_message')" --> Broadcast[io.to(room).emit]:::event
    Broadcast --> DB_Save[Save to Database]:::event
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Desktop
- A free MongoDB Atlas cluster URI

### Environment Variables
Before running the application, create the necessary `.env` files in both the frontend and backend directories.

`frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:5000
```

`backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
```

## 🐳 1-Click Deployment (Docker Compose)
The fastest way to run the entire stack (Frontend + Backend) is using Docker.

```bash
# Clone the repository
git clone https://github.com/gittam06/real-time-chat.git
cd real-time-chat

# Build and start the containers
docker-compose up --build
```
- The Frontend will be accessible at `http://localhost:5173`
- The Backend will be accessible at `http://localhost:5000`

## 💻 Manual Setup (Development Mode)
If you prefer to run the services without Docker:

### 1. Start the Backend:

```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend:

```bash
cd frontend
npm install
npm run dev
```
