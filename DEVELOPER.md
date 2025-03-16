# Awesome Hub - Developer Documentation

This document provides technical details about the Awesome Hub architecture, data flow, and development guidelines.

## Architecture Overview

Awesome Hub uses a clean separation of concerns in its architecture, while still providing an integrated experience for users:

### Backend Processing (Data Scraper)

- **Location**: `scripts/scraper.ts`
- **Purpose**: Responsible for fetching, processing, and storing data from GitHub awesome lists
- **Operation**: 
  - Runs via a custom server implementation during application startup
  - Executes on a configurable schedule (default: hourly)
  - Can be manually triggered via API
- **Data Flow**:
  1. Fetches README content from GitHub repositories
  2. Processes markdown with specialized adapters
  3. Extracts structured data
  4. Saves to JSON files

### Frontend (Next.js Application)

- **Purpose**: Displays processed data to users
- **Operation**:
  - Reads pre-processed data via API routes
  - Never directly modifies data files
  - Automatically triggers scraping when data is missing
- **Key Components**:
  - API routes in `/app/api` folder
  - Display components in `/app` folder
  - Utility functions in `/utils` folder

## Data Flow

```
                ┌─────────────────┐
                │  GitHub Repos   │
                └────────┬────────┘
                         │
                         ▼
┌───────────────────────────────────────────┐
│ scripts/scraper.ts                        │
│                                           │
│  ┌───────────┐    ┌────────────────┐      │
│  │ Fetch     │───▶│ Process        │      │
│  │ Markdown  │    │ w/ Adapters    │      │
│  └───────────┘    └───────┬────────┘      │
│                           │               │
│                           ▼               │
│                   ┌──────────────┐        │
│                   │ Save to JSON │        │
│                   └──────┬───────┘        │
└───────────────────────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ JSON Data Files │
                 └────────┬────────┘
                          │
                          ▼
┌────────────────────────────────────────────┐
│                 Next.js                    │
│                                            │
│  ┌────────────┐       ┌────────────────┐   │
│  │ API Routes │◀──────│ User Requests  │   │
│  └─────┬──────┘       └────────────────┘   │
│        │                                    │
│        ▼                                    │
│  ┌────────────┐       ┌────────────────┐   │
│  │ Read JSON  │──────▶│ Display Data   │   │
│  └────────────┘       └────────────────┘   │
└────────────────────────────────────────────┘
```

## Key Files and Directories

- `/scripts/scraper.ts` - Standalone data scraping script
- `/src/server.ts` - Custom Next.js server that integrates with scraper
- `/src/utils/system.ts` - System status utilities
- `/src/app/api/` - API routes
  - `/lists/` - List data endpoints
  - `/scrape/trigger/` - Manual scraper trigger endpoint
  - `/init/` - System initialization check endpoint
- `/data/lists/` - Directory where processed data is stored
  - `tracked-repos.json` - Configuration of tracked repositories
  - `{owner}-{repo}.json` - Processed data for each awesome list

## Data Processing

### List Adapters

The system uses specialized adapters for different awesome lists, located in:
`/src/utils/lists/adapters/`

Each adapter understands the specific format of a particular awesome list. The default adapter handles standard markdown formats, but custom adapters can be created for lists with unique structures.

### Data Storage Format

Lists are stored as JSON files with the following structure:

```json
{
  "id": "owner/repo",
  "name": "List Name",
  "description": "List description",
  "owner": "github-owner",
  "repo": "repo-name",
  "items": [
    {
      "id": "unique-id",
      "title": "Item Title",
      "description": "Item description",
      "url": "https://example.com",
      "category": "Category Name",
      "subcategory": "Subcategory Name",
      "firstSeen": "2023-01-01T00:00:00Z",
      "isNew": false
    }
  ],
  "categories": ["Category1", "Category2"],
  "subcategories": {
    "Category1": ["Subcategory1", "Subcategory2"]
  },
  "lastUpdated": "2023-01-01T00:00:00Z"
}
```

## Development Workflow

### Running the Application

Simply use:
```bash
npm run dev  # For development
npm start    # For production
```

The application will:
1. Start the Next.js server
2. Run the scraper automatically after a short delay
3. Set up periodic scraping

### Manual Scraping

During development, you can trigger a manual scrape:
```bash
npx ts-node scripts/scraper.ts
```

### Adding a New List

To add a new list to track:

1. Edit the `DEFAULT_TRACKED_REPOS` in `scripts/scraper.ts`
2. If the list has a unique format, create a custom adapter in `/src/utils/lists/adapters/`
3. Register the adapter in the `LIST_PROCESSORS` map in `scripts/scraper.ts`

## Adding Features

When adding new features, follow these guidelines:

1. **Maintain Separation**: Keep data processing in the scraper, display logic in the frontend
2. **API-First**: Any new data access should go through API routes
3. **Progressive Enhancement**: Handle cases where data might not be available
4. **Error Handling**: Provide clear error messages and recovery mechanisms

## Testing

- **Scraper Testing**: Test the scraper script in isolation first
- **API Testing**: Use tools like Postman to test API endpoints
- **UI Testing**: Test the UI with both empty and populated data stores

## Deployment

When deploying to production:

1. Build the application: `npm run build`
2. Start with production environment: `npm start`
3. The integrated server will handle both serving the app and running the scraper

## Troubleshooting

### Common Issues

- **No data appears**: Check if scraper has run successfully
- **Slow performance**: Check JSON file sizes; consider adding pagination
- **API failures**: Verify JSON file structure and permissions 