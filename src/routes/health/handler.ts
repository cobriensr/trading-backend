import { type FastifyReply, type FastifyRequest } from 'fastify';

export function healthCheckHandler(
  _request: FastifyRequest,
  _reply: FastifyReply,
): { status: string; uptime: number; timestamp: string } {
  return {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
