# Maamari

An Arabic-language portfolio website for an architecture firm, with a dark, elegant design that highlights the firm's projects and design philosophy. The site supports right-to-left (RTL) layout.

🔗 **Live site:** https://maamari-site.vercel.app

## Features

- **About:** An introduction to the firm and its experience.
- **Philosophy:** A statement summarizing the firm's vision and approach.
- **Projects Gallery:** A showcase of work, with a dedicated detail page for each project.
- **Collaborators:** A strip displaying partner organizations.
- **Testimonials:** Feedback from past clients.
- **Contact:** Contact details in the page footer.

## Tech Stack

- [React](https://react.dev/) and TypeScript
- [Vite](https://vite.dev/) for development and builds
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Arabic web fonts: IBM Plex Sans Arabic and El Messiri
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

After running `npm run dev`, open the URL printed in the terminal (usually `http://localhost:3000`).

## Project Structure

```
src/
├── components/   # Page sections (About, ProjectsGallery, Testimonials, ...)
├── index.css     # Global styles
└── ...
```

## Deployment

The site is deployed automatically to Vercel on every push to the `main` branch.

## Author

Sami - sami.tolaimat@gmail.com
