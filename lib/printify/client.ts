const PRINTIFY_BASE = "https://api.printify.com/v1"

async function printifyFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Printify API error ${res.status}: ${text}`)
  }

  return res.json()
}

export const printify = {
  get: (path: string) => printifyFetch(path),
  post: (path: string, body: unknown) =>
    printifyFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) =>
    printifyFetch(path, { method: "PUT", body: JSON.stringify(body) }),
}
