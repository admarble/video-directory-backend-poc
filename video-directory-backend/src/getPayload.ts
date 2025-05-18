import { Payload, getPayload } from 'payload'
import config from './payload.config'

export const getPayloadClient = async (): Promise<Payload> => {
  return getPayload({
    // Initialize Payload with the config
    config,
    // Additional options can be passed but are not required
  })
} 