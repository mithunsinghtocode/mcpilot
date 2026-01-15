// Stripe handler
// Requires STRIPE_SECRET_KEY

const STRIPE_API = "https://api.stripe.com/v1";

export async function handleStripe(
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error(
      "STRIPE_SECRET_KEY not configured. Get your API key from https://dashboard.stripe.com/apikeys and set it as STRIPE_SECRET_KEY environment variable."
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  async function stripeFetch(endpoint: string, method = "GET", body?: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${STRIPE_API}${endpoint}`, {
      method,
      headers,
      body: body ? new URLSearchParams(body as Record<string, string>).toString() : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Stripe API Error: ${(data as { error?: { message?: string } }).error?.message || response.statusText}`);
    }
    
    return data;
  }

  switch (toolName) {
    case "list_customers": {
      const limit = Math.min((params.limit as number) || 10, 100);
      
      const data = await stripeFetch(`/customers?limit=${limit}`) as {
        data: Array<{ id: string; email: string; name: string; created: number }>;
      };
      
      return {
        customers: data.data.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          created: new Date(c.created * 1000).toISOString(),
        })),
        count: data.data.length,
      };
    }

    case "create_customer": {
      const email = params.email as string;
      const name = params.name as string;
      
      if (!email) throw new Error("Email is required");
      
      const body: Record<string, string> = { email };
      if (name) body.name = name;
      
      const customer = await stripeFetch("/customers", "POST", body) as {
        id: string;
        email: string;
        name: string;
        created: number;
      };
      
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: new Date(customer.created * 1000).toISOString(),
      };
    }

    case "create_payment_intent": {
      const amount = params.amount as number;
      const currency = (params.currency as string) || "usd";
      const customer = params.customer as string;
      
      if (!amount) throw new Error("Amount is required (in cents)");
      
      const body: Record<string, string> = {
        amount: amount.toString(),
        currency,
      };
      if (customer) body.customer = customer;
      
      const intent = await stripeFetch("/payment_intents", "POST", body) as {
        id: string;
        amount: number;
        currency: string;
        status: string;
        client_secret: string;
      };
      
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret,
      };
    }

    case "list_invoices": {
      const customer = params.customer as string;
      const limit = Math.min((params.limit as number) || 10, 100);
      
      let endpoint = `/invoices?limit=${limit}`;
      if (customer) endpoint += `&customer=${customer}`;
      
      const data = await stripeFetch(endpoint) as {
        data: Array<{ id: string; customer: string; amount_due: number; currency: string; status: string; created: number }>;
      };
      
      return {
        invoices: data.data.map(inv => ({
          id: inv.id,
          customer: inv.customer,
          amountDue: inv.amount_due,
          currency: inv.currency,
          status: inv.status,
          created: new Date(inv.created * 1000).toISOString(),
        })),
      };
    }

    case "list_products": {
      const limit = Math.min((params.limit as number) || 10, 100);
      
      const data = await stripeFetch(`/products?limit=${limit}`) as {
        data: Array<{ id: string; name: string; description: string; active: boolean }>;
      };
      
      return {
        products: data.data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
        })),
      };
    }

    default:
      throw new Error(`Unknown Stripe tool: ${toolName}`);
  }
}
