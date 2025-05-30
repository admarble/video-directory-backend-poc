import { type Payload, getPayload as payloadGetPayload } from 'payload'
import config from './payload.config'

const initializePayload = async (): Promise<Payload> => {
  return payloadGetPayload({
    // Initialize Payload with the config
    config,
    // Additional options can be passed but are not required
  })
}

// Export both names for backward compatibility
export const getPayloadClient = initializePayload
export const getPayload = initializePayload 