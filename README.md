# Awesome Hub

A centralized platform for exploring GitHub awesome lists with a modern UI and automatic updates.

## Features

- **Automatic Scraping**: Automatically fetches and updates data from GitHub awesome lists
- **Modern UI**: Explore awesome lists with a clean, responsive interface
- **New Item Tracking**: Easily identify newly added resources
- **Categorized Browsing**: Browse resources by categories and subcategories

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd awesome-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

The application will automatically fetch data from GitHub awesome lists on startup. This process might take a few minutes on the first run. Once complete, you can:

- Browse all tracked awesome lists on the homepage
- View details of a specific list by clicking on it
- Filter resources by category or search for specific items
- Check the "New Items" tab to see recently added resources

If you need to manually update the data, simply click the "Update Data" button on any list page.

## Configuration

### Adding new awesome lists

To track additional awesome lists, edit the `DEFAULT_TRACKED_REPOS` array in `scripts/scraper.ts`:

```typescript
const DEFAULT_TRACKED_REPOS = [
  { owner: 'sindresorhus', repo: 'awesome' },
  { owner: 'awesome-selfhosted', repo: 'awesome-selfhosted' },
  // Add your list here
  { owner: 'username', repo: 'repo-name' }
];
```

After adding a new list, restart the application or trigger a manual update.

## Deployment

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

The application will run with optimized performance in production mode.

## Technical Details

For developers interested in the architecture and how to extend the application, see [DEVELOPER.md](DEVELOPER.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.