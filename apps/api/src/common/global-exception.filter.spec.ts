import type { ArgumentsHost } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

function run(exception: unknown) {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const host = {
    switchToHttp: () => ({ getResponse: () => res, getRequest: () => ({ url: '/x', method: 'POST' }) }),
  } as unknown as ArgumentsHost;
  new GlobalExceptionFilter().catch(exception, host);
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] };
}

describe('GlobalExceptionFilter', () => {
  it('maps an oversized body to 413', () => {
    const err = Object.assign(new Error('request entity too large'), { type: 'entity.too.large', status: 413 });
    expect(run(err)).toEqual({ status: 413, body: { statusCode: 413, message: 'Request body is too large' } });
  });

  it('maps malformed JSON to 400 without echoing parser internals', () => {
    const err = Object.assign(new SyntaxError('Unexpected token'), { type: 'entity.parse.failed', status: 400 });
    expect(run(err)).toEqual({ status: 400, body: { statusCode: 400, message: 'Request body is not valid JSON' } });
  });

  it('passes HttpExceptions through', () => {
    expect(run(new NotFoundException('gone')).status).toBe(404);
  });

  it('hides unknown errors behind a generic 500', () => {
    expect(run(new Error('db exploded'))).toEqual({
      status: 500,
      body: { statusCode: 500, message: 'Internal server error' },
    });
  });
});
