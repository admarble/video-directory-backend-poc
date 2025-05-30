/**
 * Serialize data for React Server Components
 * Converts MongoDB ObjectIds and other complex objects to plain values
 * Fixes: "Objects with toJSON methods are not supported" error
 */

export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(serializeForClient) as T
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString() as T
  }

  // Handle MongoDB ObjectIds and other objects with toJSON
  if (data && typeof data === 'object' && 'toJSON' in data && typeof data.toJSON === 'function') {
    return data.toString() as T
  }

  // Handle plain objects
  if (data && typeof data === 'object' && data.constructor === Object) {
    const serialized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeForClient(value)
    }
    return serialized as T
  }

  // For other complex objects, try JSON parse/stringify
  try {
    return JSON.parse(JSON.stringify(data)) as T
  } catch {
    // If serialization fails, convert to string
    return String(data) as T
  }
}

/**
 * Alternative serialization specifically for Payload CMS data
 */
export function serializePayloadData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Convert ObjectIds to strings
    if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
      return value.toString()
    }
    
    // Convert Dates to ISO strings
    if (value instanceof Date) {
      return value.toISOString()
    }
    
    // Handle objects with toJSON method
    if (value && typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function') {
      return value.toString()
    }
    
    return value
  })) as T
}
