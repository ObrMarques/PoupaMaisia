import axios from "axios";

const PLUGGY_BASE = "https://api.pluggy.ai";

let cachedApiKey: string | null = null;
let cacheExpiresAt = 0;

export async function getPluggyApiKey(): Promise<string> {
  if (cachedApiKey && Date.now() < cacheExpiresAt) {
    return cachedApiKey;
  }

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET são obrigatórios.");
  }

  const response = await axios.post(`${PLUGGY_BASE}/auth`, {
    clientId,
    clientSecret,
  });

  cachedApiKey = response.data.apiKey as string;
  // API keys are valid for 2 hours — cache for 100 minutes
  cacheExpiresAt = Date.now() + 100 * 60 * 1000;

  return cachedApiKey;
}

export async function createConnectToken(itemId?: string): Promise<string> {
  const apiKey = await getPluggyApiKey();
  const body: Record<string, any> = {};
  if (itemId) body.itemId = itemId;

  const response = await axios.post(`${PLUGGY_BASE}/connect_token`, body, {
    headers: { "X-API-KEY": apiKey },
  });

  return response.data.accessToken as string;
}

export async function getItem(itemId: string): Promise<any> {
  const apiKey = await getPluggyApiKey();
  const response = await axios.get(`${PLUGGY_BASE}/items/${itemId}`, {
    headers: { "X-API-KEY": apiKey },
  });
  return response.data;
}

export async function getAccounts(itemId: string): Promise<any[]> {
  const apiKey = await getPluggyApiKey();
  const response = await axios.get(`${PLUGGY_BASE}/accounts`, {
    headers: { "X-API-KEY": apiKey },
    params: { itemId },
  });
  return response.data.results ?? [];
}

export async function getTransactions(
  accountId: string,
  opts: { from?: string; to?: string; pageSize?: number; page?: number } = {}
): Promise<{ results: any[]; total: number; totalPages: number }> {
  const apiKey = await getPluggyApiKey();
  const response = await axios.get(`${PLUGGY_BASE}/transactions`, {
    headers: { "X-API-KEY": apiKey },
    params: {
      accountId,
      from: opts.from,
      to: opts.to,
      pageSize: opts.pageSize ?? 500,
      page: opts.page ?? 1,
    },
  });
  return {
    results: response.data.results ?? [],
    total: response.data.total ?? 0,
    totalPages: response.data.totalPages ?? 1,
  };
}
