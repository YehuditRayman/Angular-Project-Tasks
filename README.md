# 🚀 Task Management System

A modern, full-featured Task Management application built with **Angular 18+**. This system allows users to manage Teams, Projects, and Tasks efficiently using a Kanban-style board with Drag & Drop capabilities.

The application leverages the latest Angular features such as **Signals** for state management and **Standalone Components**.

---

## ✨ Features

### 🔐 Authentication & Security
* **User Registration & Login:** Secure JWT-based authentication.
* **Auth Guards:** Protected routes to ensure only logged-in users access the dashboard.
* **Http Interceptors:** Automatic token attachment to API requests and global error handling.

### 👥 Teams & Projects
* **Team Management:** Create and view teams.
* **Project Organization:** Filter projects by teams or view all projects globally.
* **Global Search:** Real-time search for projects and tasks across the system.

### 📋 Task Management (Kanban Board)
* **Drag & Drop:** Move tasks between statuses (Todo / In Progress / Done) using **Angular CDK**.
* **Task Details:** Create, Edit, and Delete tasks.
* **Priorities & Due Dates:** Visual indicators for task priority (Low, Normal, High) and deadlines.
* **Comments System:** Chat-like interface for task-specific comments and updates.

### 🎨 UI/UX
* **Angular Material:** Clean and responsive design using Material components.
* **Custom Toasts:** Non-intrusive notifications for success/error messages.
* **Custom Dialogs:** Styled confirmation dialogs for critical actions.

---

## 🛠️ Tech Stack

* **Framework:** Angular 18+ (Standalone Components)
* **Language:** TypeScript
* **State Management:** Angular Signals (computed, effect, signal)
* **Styling:** CSS / SCSS, Angular Material
* **Utilities:** Angular CDK (Drag & Drop), RxJS
* **Forms:** Reactive Forms

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
cd task-manager
ng s