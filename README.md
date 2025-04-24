# Ravenna MCP Server

This is a Model Context Protocol (MCP) server for the Ravenna help desk platform, allowing LLMs to create, update, and retrieve tickets directly from Ravenna.

## Features

- Create tickets with title, description, priority, and tags
- Update existing tickets (title, description, status, priority, etc.)
- List tickets with various filters (status, priority, assignee, tags)
- Get detailed information about specific tickets

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set your Ravenna API key as an environment variable:

```bash
export RAVENNA_API_KEY=your_api_key_here
```

## Running the Server

```bash
bun run index.ts
# or
npm run start
```

The server runs on stdio, making it compatible with MCP clients like Claude Desktop or other MCP-enabled applications.

## Tools

### Create Ticket

Creates a new ticket in Ravenna.

**Required fields:**

- `title`: The title of the ticket
- `description`: A detailed description of the ticket

**Optional fields:**

- `priority`: Ticket priority (low, medium, high, urgent)
- `tags`: Array of string tags to categorize the ticket

**Example:**

```json
{
  "title": "Website login issue",
  "description": "Users are unable to log in to the customer portal after the latest update.",
  "priority": "high",
  "tags": ["website", "login", "customer-portal"]
}
```

### Update Ticket

Updates an existing ticket in Ravenna.

**Required fields:**

- `id`: The ID of the ticket to update

**Optional fields:**

- `title`: Updated title of the ticket
- `description`: Updated description of the ticket
- `status`: Updated status (open, in_progress, pending, resolved, closed)
- `priority`: Updated priority (low, medium, high, urgent)
- `assignee`: User ID to assign the ticket to
- `tags`: Updated tags for the ticket

**Example:**

```json
{
  "id": "12345",
  "status": "in_progress",
  "assignee": "user_id_123",
  "priority": "high"
}
```

### List Tickets

Lists tickets in Ravenna with optional filters.

**Optional fields:**

- `status`: Filter by ticket status (open, in_progress, pending, resolved, closed, all)
- `priority`: Filter by ticket priority (low, medium, high, urgent, all)
- `assignee`: Filter by assignee user ID
- `tags`: Filter by tags (any match)
- `limit`: Maximum number of tickets to return

**Example:**

```json
{
  "status": "open",
  "priority": "high",
  "limit": 10
}
```

### Get Ticket

Get detailed information about a specific ticket.

**Required fields:**

- `id`: The ID of the ticket to retrieve

**Example:**

```json
{
  "id": "12345"
}
```

## API Reference

This server uses the Ravenna API, as documented in https://docs.ravenna.ai/api-reference/.

## MCP Integration

This server implements the Model Context Protocol (MCP), making it compatible with MCP clients. It exposes tools that can be used by large language models to interact with Ravenna.

## Environment Variables

- `RAVENNA_API_KEY`: Your Ravenna API key (required)

## Error Handling

All tools include proper error handling and will return appropriate error messages if issues occur. Make sure your Ravenna API key is correctly set up and that you have the necessary permissions to perform operations.
