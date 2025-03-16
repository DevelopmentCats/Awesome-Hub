# Awesome Hub Scraper

This directory contains the backend scraper for Awesome Hub. The scraper is responsible for:

1. Fetching awesome lists from GitHub
2. Processing and parsing the markdown
3. Extracting structured data
4. Saving the data to JSON files

## Setup

Make the script executable:

```bash
chmod +x scraper.ts
```

## Running Manually

To run the scraper manually:

```bash
# From the project root
npx ts-node --project tsconfig.server.json scripts/scraper.ts
```

## Automated Execution

For production use, you'll want to set up automated execution. Here are a few options:

### Option 1: Cron Job

Add a cron job to run the scraper at regular intervals. For example, to run it every hour:

```bash
# Edit crontab
crontab -e

# Add this line to run every hour
0 * * * * cd /path/to/awesome-hub && npx ts-node --project tsconfig.server.json scripts/scraper.ts >> /path/to/logs/scraper.log 2>&1
```

### Option 2: Systemd Timer

On Linux systems with systemd, you can create a systemd timer:

1. Create a service file `/etc/systemd/system/awesome-hub-scraper.service`:

```ini
[Unit]
Description=Awesome Hub Scraper
After=network.target

[Service]
Type=oneshot
User=youruser
WorkingDirectory=/path/to/awesome-hub
ExecStart=/usr/bin/npx ts-node --project tsconfig.server.json scripts/scraper.ts
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

2. Create a timer file `/etc/systemd/system/awesome-hub-scraper.timer`:

```ini
[Unit]
Description=Run Awesome Hub Scraper hourly

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
AccuracySec=1s

[Install]
WantedBy=timers.target
```

3. Enable and start the timer:

```bash
sudo systemctl enable awesome-hub-scraper.timer
sudo systemctl start awesome-hub-scraper.timer
```

## Output

The scraper saves data to the `data/lists` directory in the project root:

- `tracked-repos.json`: List of repositories being tracked
- `{owner}-{repo}.json`: Processed data for each awesome list 