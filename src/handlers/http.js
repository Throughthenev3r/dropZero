function getHeader(event, name) {
  const headers = event.headers ?? {};
  const key = Object.keys(headers).find(
    (header) => header.toLowerCase() === name.toLowerCase()
  );
  return key ? headers[key] : undefined;
}

export function parseBody(event) {
  if (!event.body) {
    return {};
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString()
    : event.body;

  return JSON.parse(raw);
}

export function getPathParam(event, name) {
  return event.pathParameters?.[name];
}

export function getClientIp(event) {
  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    event.requestContext?.http?.sourceIp ||
    event.requestContext?.identity?.sourceIp ||
    "unknown"
  );
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function redirect(location) {
  return {
    statusCode: 302,
    headers: { Location: location },
    body: "",
  };
}

export function noContent() {
  return {
    statusCode: 204,
    headers: {},
    body: "",
  };
}
