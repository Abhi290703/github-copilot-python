# GitHub Copilot Custom Instructions: Sudoku Project

## Role & Objectives
You are an expert Python and Web Developer assistant helping build and refactor a fully featured, browser-based Sudoku application. Your goal is to ensure high code quality, accessibility, performance, and adherence to clean architecture patterns.

## Python / Backend Guidelines (`app.py`, `sudoku_logic.py`)
- Follow PEP 8 style guidelines with clear type annotations and docstrings.
- Ensure all puzzle generation algorithms produce boards with a **single, unique solution** using recursive backtracking.
- Implement clear endpoint contracts for `/new`, `/check`, and `/hint` returning consistent JSON structures.
- Use pytest-compatible testing conventions with dedicated unit tests in `tests/test_app.py`.

## Frontend Guidelines (`index.html`, `styles.css`, `main.js`)
- Maintain a clean separation of concerns: markup in HTML, layout/theme variables in CSS, and game logic in vanilla JS.
- Provide smooth UI interactions: real-time duplicate validation, persistent theme toggling (dark/light), and leaderboard persistence via `localStorage`.
- Ensure responsive UI with CSS Grid and accessible controls.

## Critical Evaluation Principles
- Verify edge cases for algorithmic complexity (e.g., avoiding infinite recursion or timeout in puzzle generation).
- Prefer robust, deterministic validation logic over naive string comparisons.