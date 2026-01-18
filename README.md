
# 🇯🇵 Nihongo Notes - Deployment Guide

This project is configured to deploy automatically to GitHub Pages using Vite and GitHub Actions.

## 🚀 How to Deploy

1.  **Create a Repository**: Create a new public repository on GitHub.
2.  **Push the Code**: Initialize git and push these files to the `main` branch.
    ```bash
    git init
    git add .
    git commit -m "initial commit"
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```
3.  **Add your Gemini API Key**:
    *   Go to your GitHub Repository **Settings**.
    *   Navigate to **Secrets and variables** > **Actions**.
    *   Click **New repository secret**.
    *   Name: `GEMINI_API_KEY`.
    *   Value: Paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/).
4.  **Configure GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Branch**, select `gh-pages` and `/ (root)`.
    *   Save.

Once the GitHub Action completes, your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`.

## 🛠 Tech Stack
- **React 19** & **TypeScript**
- **Vite** (Build Tool)
- **Google Gemini API** (AI Sensei)
- **GitHub Actions** (CI/CD)
