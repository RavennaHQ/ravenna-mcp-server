#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "ravenna-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Define tools for Ravenna ticket management
const CREATE_TICKET_TOOL: Tool = {
  name: "create_ticket",
  description: "Create a new ticket in Ravenna",
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "The title of the ticket",
      },
      description: {
        type: "string",
        description: "A detailed description of the ticket",
      },
      priority: {
        type: "string",
        description: "Priority of the ticket (low, medium, high, urgent)",
        enum: ["low", "medium", "high", "urgent"],
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Tags to categorize the ticket",
      },
    },
    required: ["title", "description"],
  },
  annotations: {
    title: "Create Ticket",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

const UPDATE_TICKET_TOOL: Tool = {
  name: "update_ticket",
  description: "Update an existing ticket in Ravenna",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the ticket to update",
      },
      title: {
        type: "string",
        description: "Updated title of the ticket",
      },
      description: {
        type: "string",
        description: "Updated description of the ticket",
      },
      status: {
        type: "string",
        description: "Updated status of the ticket",
        enum: ["open", "in_progress", "pending", "resolved", "closed"],
      },
      priority: {
        type: "string",
        description: "Updated priority of the ticket",
        enum: ["low", "medium", "high", "urgent"],
      },
      assignee: {
        type: "string",
        description: "User ID to assign the ticket to",
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Updated tags for the ticket",
      },
    },
    required: ["id"],
  },
  annotations: {
    title: "Update Ticket",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

const LIST_TICKETS_TOOL: Tool = {
  name: "list_tickets",
  description: "List tickets in Ravenna with optional filters",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Filter by ticket status",
        enum: ["open", "in_progress", "pending", "resolved", "closed", "all"],
      },
      priority: {
        type: "string",
        description: "Filter by ticket priority",
        enum: ["low", "medium", "high", "urgent", "all"],
      },
      assignee: {
        type: "string",
        description: "Filter by assignee user ID",
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Filter by tags (any match)",
      },
      limit: {
        type: "number",
        description: "Maximum number of tickets to return",
      },
    },
  },
  annotations: {
    title: "List Tickets",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

const GET_TICKET_TOOL: Tool = {
  name: "get_ticket",
  description: "Get detailed information about a specific ticket",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The ID of the ticket to retrieve",
      },
    },
    required: ["id"],
  },
  annotations: {
    title: "Get Ticket",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

// Update tool list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    CREATE_TICKET_TOOL,
    UPDATE_TICKET_TOOL,
    LIST_TICKETS_TOOL,
    GET_TICKET_TOOL,
  ],
}));

// Function to create a ticket
async function createTicket(
  title: string,
  description: string,
  priority?: string,
  tags?: string[],
) {
  const api_key = process.env.RAVENNA_API_KEY;

  if (!api_key) {
    throw new Error("RAVENNA_API_KEY is required");
  }

  const options = {
    method: "POST",
    headers: {
      "x-ravenna-api-token": `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      priority: priority || "medium",
      tags: tags || [],
    }),
  };

  try {
    const response = await fetch(
      "https://core.api.ravennahq.com/api/tickets",
      options,
    );

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }

    const data = await response.json() as {
      id: string;
      title: string;
      priority: string;
      status: string;
    };

    return [
      {
        type: "text",
        text: `Successfully created ticket #${data.id}:\nTitle: ${data.title}\nPriority: ${data.priority}\nStatus: ${data.status}`,
      },
    ];
  } catch (error) {
    return [
      {
        type: "text",
        text: `Error creating ticket: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

// Function to update a ticket
async function updateTicket(id: string, updates: Record<string, any>) {
  const api_key = process.env.RAVENNA_API_KEY;

  if (!api_key) {
    throw new Error("RAVENNA_API_KEY is required");
  }

  // Remove id from updates object
  const { id: _, ...updateData } = updates;

  const options = {
    method: "PUT",
    headers: {
      "x-ravenna-api-token": `Bearer ${api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  };

  try {
    const response = await fetch(
      `https://core.api.ravennahq.com/api/tickets/${id}`,
      options,
    );

    if (!response.ok) {
      throw new Error(`Failed to update ticket: ${response.statusText}`);
    }

    const data = await response.json() as {
      id: string;
      title: string;
      priority: string;
      status: string;
    };

    return [
      {
        type: "text",
        text: `Successfully updated ticket #${data.id}:\nTitle: ${data.title}\nPriority: ${data.priority}\nStatus: ${data.status}`,
      },
    ];
  } catch (error) {
    return [
      {
        type: "text",
        text: `Error updating ticket: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

// Function to list tickets
async function listTickets(filters: Record<string, any>) {
  const api_key = process.env.RAVENNA_API_KEY;

  if (!api_key) {
    throw new Error("RAVENNA_API_KEY is required");
  }

  // Build query parameters from filters
  const queryParams = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    queryParams.append("status", filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    queryParams.append("priority", filters.priority);
  }

  if (filters.assignee) {
    queryParams.append("assignee", filters.assignee);
  }

  if (filters.limit) {
    queryParams.append("limit", filters.limit.toString());
  } else {
    queryParams.append("limit", "10");
  }

  // Tags would be handled differently depending on the API
  // This is a simplified example
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag: string) => {
      queryParams.append("tags[]", tag);
    });
  }

  const url = `https://core.api.ravennahq.com/api/tickets?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-ravenna-api-token": `Bearer ${api_key}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list tickets: ${await response.text()}`);
    }

    return [
      {
        type: "text",
        text: `${await response.text()}`,
      },
    ];
  } catch (error) {
    return [
      {
        type: "text",
        text: `Error listing tickets: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

// Function to get a specific ticket
async function getTicket(id: string) {
  const api_key = process.env.RAVENNA_API_KEY;

  if (!api_key) {
    throw new Error("RAVENNA_API_KEY is required");
  }

  try {
    const response = await fetch(
      `https://core.api.ravennahq.com/api/tickets/${id}`,
      {
        method: "GET",
        headers: {
          "x-ravenna-api-token": `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get ticket: ${await response.text()}`);
    }

    const ticket = await response.json() as {
      id: string;
      title: string;
      status: string;
      priority: string;
      created_at: string;
      updated_at: string;
      assignee: string | null;
      tags: string[];
      description: string;
    };

    // Format ticket details for better readability
    const ticketDetails = [
      `Ticket #${ticket.id}`,
      `Title: ${ticket.title}`,
      `Status: ${ticket.status}`,
      `Priority: ${ticket.priority}`,
      `Created: ${new Date(ticket.created_at).toLocaleString()}`,
      `Updated: ${new Date(ticket.updated_at).toLocaleString()}`,
      ticket.assignee ? `Assignee: ${ticket.assignee}` : "Assignee: Unassigned",
      ticket.tags && ticket.tags.length > 0
        ? `Tags: ${ticket.tags.join(", ")}`
        : "Tags: None",
      "",
      "Description:",
      ticket.description,
    ].join("\n");

    return [
      {
        type: "text",
        text: ticketDetails,
      },
    ];
  } catch (error) {
    return [
      {
        type: "text",
        text: `Error retrieving ticket: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "create_ticket") {
      const input = request.params.arguments as {
        title: string;
        description: string;
        priority?: string;
        tags?: string[];
      };
      return {
        content: await createTicket(
          input.title,
          input.description,
          input.priority,
          input.tags,
        ),
      };
    }

    if (request.params.name === "update_ticket") {
      const input = request.params.arguments as {
        id: string;
        [key: string]: any;
      };
      return { content: await updateTicket(input.id, input) };
    }

    if (request.params.name === "list_tickets") {
      const input = request.params.arguments as Record<string, any>;
      return { content: await listTickets(input || {}) };
    }

    if (request.params.name === "get_ticket") {
      const input = request.params.arguments as { id: string };
      return { content: await getTicket(input.id) };
    }

    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`,
    );
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

server.onerror = (error: any) => {
  console.error(error);
};

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ravenna MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
