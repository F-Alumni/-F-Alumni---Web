/**
 * Deprecated direct Cloudinary connector.
 * Re-routes all calls through the secure Backend-Mediated Upload Service.
 * Never connects directly to Cloudinary or exposes API secrets on the client.
 */
export * from './uploadService'
