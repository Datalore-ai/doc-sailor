export interface SetupRequest {
  link: string;
  session_id: number | null;
  should_setup_new: boolean;
}

export interface QueryRequest {
  query: string;
  session_id: number | null;
  max_results: number;
}

export interface QueryResult {
  page: number;
  content: string;
  source_link: string;
}

export async function setupDocs(request: SetupRequest, onMessage: (msg: string) => void): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/setup_docs`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Setup failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body received.");
  }

  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    chunk.split("\n\n").forEach(line => {
      if (line.startsWith("data:")) {
        onMessage(line.replace(/^data:\s*/, ""));
      }
    });
  }
}

export async function queryDocs(request: QueryRequest): Promise<{ result: QueryResult[] }> {
  const url = `${import.meta.env.VITE_API_URL}/query_docs`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Query failed: ${response.statusText}`);
  }

  // Handle possible malformed result
  const data = await response.json();

  const result = (data.result || []).map((item: any) => ({
    page: typeof item.page === "object" ? Object.values(item.page)[0] : item.page,
    content: typeof item.content === "object" ? Object.values(item.content)[0] : item.content,
    source_link: typeof item.source_link === "object" ? Object.values(item.source_link)[0] : item.source_link,
  }));

  return { result };
}
